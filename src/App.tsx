import React, { useCallback, useState, useEffect, useRef } from 'react';
import { AppStyles } from './AppStyles';
import { Graph } from './A-Star';
import './App.css';

export function numberWithCommas(number: number | string): string {
  const [whole, fraction] = number.toString().split('.');

  if (fraction) return (`${whole.replace(/(.)(?=(\d{3})+$)/g, '$1,') }.${fraction}`);

  return (`${whole.replace(/(.)(?=(\d{3})+$)/g, '$1,') }`);
}


function App() {
  const classes = AppStyles();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const tileLength = 15;

  const [index, setIndex] = useState<number>(0);
  const [graphList, setGraphList] = useState<Graph[]>([]);

  const [gValue, setGValue] = useState('greater');
  const [algorithm, setAlgorithm] = useState('forward');

  const [stats, setStats] = useState<any>();
  const [currentStats, setCurrentStats] = useState<any>();
  
  const updateCurrentStats = useCallback(() => {
    setCurrentStats({
      nodes_expanded: graphList[index].nodes_expanded,
      search_duration: graphList[index].search_duration,
      target_reachable: graphList[index].target_reachable
    });
  }, [graphList, index]);

  
  const generateGraphSet = useCallback(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const graphs = [];
    
    for (let i = 0; i < 50; i++) {
      const graph = new Graph(ctx, tileLength);
      graph.init(
        { x: randomInRange(), y: randomInRange() },
        { x: randomInRange(), y: randomInRange() }
      );
      graph.setAlgorithm(algorithm);
      graph.setGValue(gValue);
      graphs.push(graph);
    }

    setGraphList(graphs);
    setIndex(0);
  }, [algorithm, gValue]);

  useEffect(() => {
    if (graphList.length <= 0) return;

    graphList[index].render();
    graphList[index].renderMoves();
    updateCurrentStats();
  }, [index, graphList, updateCurrentStats]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    
    if (!ctx) return;
    contextRef.current = ctx;

    generateGraphSet();
  }, [generateGraphSet]);

  const updateAllStats = () => {
    const summations = graphList.reduce((acc, curr) => {
      return {
        nodes_expanded: acc.nodes_expanded + curr.nodes_expanded,
        search_duration: acc.search_duration + curr.search_duration,
        target_reachable: acc.target_reachable + (curr.target_reachable && curr.searched ? 1 : 0)
      }
    }, {
      nodes_expanded: 0,
      search_duration: 0,
      target_reachable: 0
    } as any);

    setStats(summations);
  }

  const randomInRange = () => {
    if (!canvasRef.current) return 0;
    const canvas = canvasRef.current;
    
    const low = 0;
    const high = canvas.width / tileLength;
    return Math.floor(Math.random() * (1 + high - low)) + low;
  }

  const generateNewGraph = () => {
    if (!contextRef.current) return;
    const ctx = contextRef.current;
    if (graphList.length <= 0) return;

    const graph = new Graph(ctx, tileLength);
    graph.init(
      { x: randomInRange(), y: randomInRange() },
      { x: randomInRange(), y: randomInRange() }
    );

    graphList[index] = graph;
    graph.render();
  }

  const resetGraph = () => {
    graphList[index].agent = graphList[index].nodeList[graphList[index].initialAgent.y][graphList[index].initialAgent.x];
    graphList[index].target = graphList[index].nodeList[graphList[index].initialTarget.y][graphList[index].initialTarget.x];

    graphList[index].reset();
    graphList[index].render();

    graphList[index].nodes_expanded = 0;
    graphList[index].search_duration = 0;
  }

  const executeAll = () => {
    for (let i = 0; i < graphList.length; i++) {
      moveToTarget(graphList[i], i);
    }

    graphList[index].render();
    graphList[index].renderMoves();
    alert('All graphs finished pathfinding');
  }
  
  const search = async () => {
    graphList[index].setAlgorithm(algorithm);
    graphList[index].setGValue(gValue);
    graphList[index].search(index, true);
  }

  const moveToTarget = async (graph: Graph, index: number, animated?: boolean) => {
    graph.setAlgorithm(algorithm);
    graph.setGValue(gValue);
    graph.search(index);

    let loopCount = 0;
    let nextIndex = 0;
    while (graph.agent.key !== graph.target.key) {
      if (graph.path.length === 0) return;
      if (!graph.target_reachable) return;
      if (loopCount > 1000) {
        graph.target_reachable = false;
        return;
      }

      const next = graph.path[nextIndex];

      if ((!next?.y && !next?.x) || graph.nodeList[next.y][next.x].wall) {
        graph.search(index);
        nextIndex = 0;
      } else {
        graph.moveAgent(next);
        nextIndex++;
      }

      loopCount++;
      graph.render();
      graph.renderAgents();
      if (animated) await new Promise((resolve) => setTimeout(resolve, 20));
    }

    graphList[index].renderMoves();
  }

  const onGraphSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const i = Number(event.target.value);

    setIndex(i);
  }

  const onGSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setGValue(event.target.value)

    graphList.forEach((graph) => {
      graph.setGValue(event.target.value);
    });
  }

  const onAlgoSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setAlgorithm(event.target.value)

    graphList.forEach((graph) => {
      graph.setAlgorithm(event.target.value);
    });
  }

  return (
    <div className={classes.root}>
      <main className={classes.container}>
        <div className={classes.left}>
          <canvas className={classes.canvas} ref={canvasRef} width={720} height={720} />
        </div>
        <div className={classes.right}>
          <div className={classes.container}>
            <div className={classes.left}>
              <div className={classes.actionsContainer}>
                <div className={classes.pageActions}>
                  <div className={classes.headerContainer}>
                    <p className={classes.headers}>Actions</p>
                  </div>
                  <button className={classes.button} onClick={generateGraphSet}>Generate New Set</button>
                  <button className={classes.button} onClick={executeAll}>Execute All Graphs</button>
                  <select onChange={onGraphSelect} value={index} className={classes.button}>
                    {graphList.map((_, index) => (
                      <option key={`graph-${index}`} value={index}>Graph {index + 1}</option>
                    ))}
                  </select>
                  <select onChange={onGSelect} value={gValue} className={classes.button}>
                    <option value="none">No G-Value Preference</option>
                    <option value="smaller">Prefer Smaller G-Values</option>
                    <option value="greater">Prefer Greater G-Values</option>
                  </select>
                  <select onChange={onAlgoSelect} value={algorithm} className={classes.button}>
                    <option value="forward">Repeating Forward A*</option>
                    <option value="backward">Repeating Backward A*</option>
                    <option value="adaptive-forward">Adaptive Forward A*</option>
                    <option value="adaptive-backward">Adaptive Backward A*</option>
                  </select>
                </div>
                <div className={classes.graphActions}>
                  <div className={classes.headerContainer}>
                    <p className={classes.headers}>Selected Graph Actions</p>
                  </div>
                  <button className={classes.button} onClick={() => moveToTarget(graphList[index], index, true)}>Play</button>
                  <button className={classes.button} onClick={search}>Search</button>
                  <button className={classes.button} onClick={resetGraph}>Reset</button>
                  <button className={classes.button} onClick={generateNewGraph}>Regenerate</button>
                </div>
              </div>
            </div>
            <div className={classes.right}>
              <div className={classes.actionsContainer}>
                <div className={classes.pageActions}>
                  <div className={classes.headerContainer}>
                    <p className={classes.headers}>Statistics of All Graphs</p>
                    <button className={classes.svgButton} onClick={updateAllStats}>
                      <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24px" height="24px" viewBox="0 0 512 512">
                        <g>
                          <path d="M479.971,32.18c-21.72,21.211-42.89,43-64.52,64.301c-1.05,1.23-2.26-0.16-3.09-0.85   c-24.511-23.98-54.58-42.281-87.221-52.84c-37.6-12.16-78.449-14.07-117.029-5.59c-68.67,14.67-128.811,64.059-156.44,128.609   c0.031,0.014,0.062,0.025,0.093,0.039c-2.3,4.537-3.605,9.666-3.605,15.1c0,18.475,14.977,33.451,33.451,33.451   c15.831,0,29.084-11.002,32.555-25.773c19.757-41.979,58.832-74.445,103.967-85.527c52.2-13.17,111.37,1.33,149.4,40.041   c-22.03,21.83-44.391,43.34-66.33,65.26c59.52-0.32,119.06-0.141,178.59-0.09C480.291,149.611,479.931,90.891,479.971,32.18z"/>
                          <path d="M431.609,297.5c-14.62,0-27.041,9.383-31.591,22.453c-0.009-0.004-0.019-0.008-0.027-0.012   c-19.11,42.59-57.57,76.219-102.84,88.18c-52.799,14.311-113.45,0.299-152.179-39.051c21.92-21.76,44.369-43.01,66.189-64.869   c-59.7,0.049-119.41,0.029-179.11,0.01c-0.14,58.6-0.159,117.189,0.011,175.789c21.92-21.91,43.75-43.91,65.79-65.699   c14.109,13.789,29.76,26.07,46.92,35.869c54.739,31.971,123.399,38.602,183.299,17.891   c57.477-19.297,106.073-63.178,131.212-118.318c3.645-5.357,5.776-11.824,5.776-18.793C465.06,312.477,450.083,297.5,431.609,297.5   z"/>
                        </g>
                      </svg>
                    </button>
                  </div>
                  {graphList.length > 0 ? (
                    <React.Fragment>
                      <p className={classes.text}>
                        Nodes Expanded: {numberWithCommas(stats?.nodes_expanded|| 0)}
                      </p>    
                      <p className={classes.text}>
                        Search Duration: {numberWithCommas(stats?.search_duration || 0)}ms
                      </p>     
                      <p className={classes.text}>
                        Reachable Graphs: {stats?.target_reachable || 0}/50
                      </p>            
                    </React.Fragment>
                  ) : (    
                    <p className={classes.text}>Nothing to display yet</p>
                  )}
                </div>
                <div className={classes.graphActions}>
                  <div className={classes.headerContainer}>
                    <p className={classes.headers}>Selected Graph Stats</p>
                    <button className={classes.svgButton} onClick={updateCurrentStats}>
                      <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24px" height="24px" viewBox="0 0 512 512">
                        <g>
                          <path d="M479.971,32.18c-21.72,21.211-42.89,43-64.52,64.301c-1.05,1.23-2.26-0.16-3.09-0.85   c-24.511-23.98-54.58-42.281-87.221-52.84c-37.6-12.16-78.449-14.07-117.029-5.59c-68.67,14.67-128.811,64.059-156.44,128.609   c0.031,0.014,0.062,0.025,0.093,0.039c-2.3,4.537-3.605,9.666-3.605,15.1c0,18.475,14.977,33.451,33.451,33.451   c15.831,0,29.084-11.002,32.555-25.773c19.757-41.979,58.832-74.445,103.967-85.527c52.2-13.17,111.37,1.33,149.4,40.041   c-22.03,21.83-44.391,43.34-66.33,65.26c59.52-0.32,119.06-0.141,178.59-0.09C480.291,149.611,479.931,90.891,479.971,32.18z"/>
                          <path d="M431.609,297.5c-14.62,0-27.041,9.383-31.591,22.453c-0.009-0.004-0.019-0.008-0.027-0.012   c-19.11,42.59-57.57,76.219-102.84,88.18c-52.799,14.311-113.45,0.299-152.179-39.051c21.92-21.76,44.369-43.01,66.189-64.869   c-59.7,0.049-119.41,0.029-179.11,0.01c-0.14,58.6-0.159,117.189,0.011,175.789c21.92-21.91,43.75-43.91,65.79-65.699   c14.109,13.789,29.76,26.07,46.92,35.869c54.739,31.971,123.399,38.602,183.299,17.891   c57.477-19.297,106.073-63.178,131.212-118.318c3.645-5.357,5.776-11.824,5.776-18.793C465.06,312.477,450.083,297.5,431.609,297.5   z"/>
                        </g>
                      </svg>
                    </button>
                  </div>
                  {graphList.length > 0 ? (
                    <React.Fragment>
                      <p className={classes.text}>
                        Nodes Expanded: {numberWithCommas(currentStats?.nodes_expanded || 0)}
                      </p>    
                      <p className={classes.text}>
                        Search Duration: {numberWithCommas(currentStats?.search_duration || 0)}ms
                      </p>                
                      <p className={classes.text}>
                        Target Reachable: {`${currentStats?.target_reachable}` || 0}
                      </p>         
                    </React.Fragment>
                  ) : (    
                    <p className={classes.text}>Nothing to display yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
