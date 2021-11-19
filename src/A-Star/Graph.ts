import { Vector, Node } from './Node';
import { BinaryHeap } from './BinaryHeap';
// REFERENCE https://briangrinstead.com/blog/astar-search-algorithm-in-javascript/
// REFERENCE https://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html

export class Graph {
  ctx: CanvasRenderingContext2D;
  tileLength: number;

  initialAgent: Vector = { x: 0, y: 0};
  initialTarget: Vector = { x: 0, y: 0 };
  agent: Node = new Node(0, 0);
  target: Node = new Node(0, 0);
  nodeList: Array<Node[]> = [];

  // Options
  algorithm: string = 'forward';
  gValue: string = 'none';

  // Result
  target_reachable: boolean = true;
  searched: boolean = false;
  moveList: Vector[] = [];
  path: Vector[] = [];

  // Statistics
  nodes_expanded: number = 0;
  search_duration: number = 0;

  constructor(ctx: CanvasRenderingContext2D, tileLength: number) {
    this.ctx = ctx;
    this.tileLength = tileLength;
  }

  render() {
    // Clear Canvas on Every Render
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    // Render Walls
    for (const row of this.nodeList) {
      for (const node of row) {
        if (node.wall) {
          this.ctx.fillStyle = 'white';
          this.ctx.fillRect(node.x * this.tileLength, node.y * this.tileLength, this.tileLength, this.tileLength);
        }
      }
    }

    this.renderAgents();
  }

  renderMoves() {
    for (const vector of this.moveList) {
      this.ctx.fillStyle = 'purple';
      this.ctx.fillRect(vector.x * this.tileLength, vector.y * this.tileLength, this.tileLength, this.tileLength);
    }

    this.renderAgents();
  }

  renderPath() {
    for (const vector of this.path) {
      this.ctx.fillStyle = 'blue';
      this.ctx.fillRect(vector.x * this.tileLength, vector.y * this.tileLength, this.tileLength, this.tileLength);
    }

    this.renderAgents();
  }

  renderList(list: Node[]) {
    for (const node of list) {
      this.ctx.fillStyle = 'orange';
      this.ctx.fillRect(node.x * this.tileLength, node.y * this.tileLength, this.tileLength, this.tileLength);

      this.renderAgents();
    }
  }

  renderAgents() {
    // Render Agent
    this.ctx.fillStyle = 'green';
    this.ctx.fillRect(this.agent.x * this.tileLength, this.agent.y * this.tileLength, this.tileLength, this.tileLength);

    // Render Target
    this.ctx.fillStyle = 'red';
    this.ctx.fillRect(this.target.x * this.tileLength, this.target.y * this.tileLength, this.tileLength, this.tileLength);
  }

  setGValue(option: string) {
    this.gValue = option;
  }

  setAlgorithm(option: string) {
    this.algorithm = option;
  }

  init(start: Vector, target: Vector) {
    // Adding vertices
    for (let y = 0; y < this.ctx.canvas.width/this.tileLength; y++) {
      const row = [];
      for (let x = 0; x < this.ctx.canvas.height/this.tileLength; x++) {
        if (start.y === y && start.x === x) {
          this.agent.setPosition(start);
          this.agent.seen = true;
          this.initialAgent = start;
          row.push(this.agent);
          continue;
        }

        if (target.y === y && target.x === x) {
          this.target.setPosition(target);
          this.initialTarget = target;
          row.push(this.target);
          continue;
        }

        row.push(new Node(x, y));
      }
      this.nodeList.push(row);
    }

    const neighbors = this.getNeighbors(this.agent, []);
    for (const neighbor of neighbors) {
      neighbor.seen = true;
      neighbor.wall = false;
    }
  }

  getNeighbors(node: Node, closedList: Node[]): Node[] {
    const neighbors = [];

    if (node.x - 1 >= 0) neighbors.push(this.nodeList[node.y][node.x - 1]);
    if (node.x + 1 <= (this.ctx.canvas.width/this.tileLength) - 1) neighbors.push(this.nodeList[node.y][node.x + 1]);

    if (node.y - 1 >= 0) neighbors.push(this.nodeList[node.y - 1][node.x]);
    if (node.y + 1 <= (this.ctx.canvas.width/this.tileLength) - 1) neighbors.push(this.nodeList[node.y + 1][node.x]);

    return neighbors.filter((neighbor) => !closedList.find((n) => n.key === neighbor.key));
  }

  reset() {
    this.searched = false;
    this.nodeList.forEach((row) => {
      for (const node of row) {      
        node.h = 0;
        node.g = Infinity;
        node.f = Infinity;
        node.parent = null;
      }
    });
  }

  heuristic(current: Node, target: Node) {
    // Manhattan Distance
    const dx1 = Math.abs(current.x - target.x);
    const dy1 = Math.abs(current.y - target.y)

    // const dx2 = start.x - target.x;
    // const dy2 = start.y - target.y;
    // const cross = Math.abs(dx1 * dy2 - dx2 * dy1);

    return (dx1 + dy1);
  }

  moveAgent(newPosition: Vector) {
    this.agent = this.nodeList[newPosition.y][newPosition.x];
    this.moveList.push(newPosition);

    const neighbors = this.getNeighbors(this.agent, []);

    for (const neighbor of neighbors) {
      if (neighbor.seen) continue;
      neighbor.seen = true;

      if (neighbor.x === this.agent.x && neighbor.y === this.agent.y) continue;
      if (neighbor.x === this.target.x && neighbor.y === this.target.y) continue;

      neighbor.wall = Math.random() > 0.70;
    }
  }

  search(index: number, animated?: boolean) {
    switch (this.algorithm) {
      case 'adaptive-backward':
      case 'backward':
        this.backwardSearch(index, animated);
        break;
      case 'adaptive-forward':
      case 'forward':
        this.forwardSearch(index, animated);
        break;
      default:
        console.log("invalid algo");
    }
  }

  async backwardSearch(index: number, animated?: boolean) {
    if (this.searched) this.reset();
    console.log(`searching ${index}`);

    const start = this.target;
    const target = this.agent;

    if (!start || !target) return;

    this.astar(start, target, animated);
  }
  
  async forwardSearch(index: number, animated?: boolean) {
    if (this.searched) this.reset();
    console.log(`searching ${index}`);
    
    const start = this.agent;
    const target = this.target;
      
    if (!start || !target) return;

    this.astar(start, target, animated);
    this.path = this.path.reverse();
  }

  /**
   * Actual A* Algorithm Implementation
   */
  async astar(start: Node, target: Node, animated?: boolean) {
    const start_time = new Date().getTime();
    const openList = new BinaryHeap(this.gValue);
    const closedList: Node[] = [];
    const path: Node[] = [];

    if (this.algorithm !== 'adaptive') {
      for (const row of this.nodeList) {
        for (const node of row) {
          node.h = 0;
          node.g = Infinity;
          node.f = Infinity;
        }
      }
    }

    openList.insert(start);
    start.parent = null;
    start.g = 0;
    start.h = this.heuristic(start, target);
    start.f = start.g + start.h;
    
    while (true) {
      // Open list contains lowest f node at the top
      const currentNode = openList.pop();
      
      if (!currentNode) {
        console.log('target unreachable');
        this.target_reachable = false;
        this.path = [];
        return;
      }
      
      // Neighbors are only the nodes above, below, left, right
      const neighbors = this.getNeighbors(currentNode, closedList);
      for (const neighbor of neighbors) {
        if (neighbor.wall) continue;
        
        if (!closedList.find((n) => n.key === currentNode.key)) {
          // Node has not been explored yet
          openList.insert(neighbor);
          
          neighbor.h = this.heuristic(neighbor, target);
          neighbor.g = this.heuristic(neighbor, start);
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.parent = currentNode;
        }
      }
      
      closedList.push(currentNode);
      
      if (currentNode.key === target.key) {
        let current: Node = currentNode;

        while (current?.key !== start.key) {
          path.push(current);
          current = current.parent!;
        }

        path.push(start)
        break;
      }
      
      if (animated) {
        this.renderList([...openList.list, ...closedList]);
        await new Promise((resolve) => setTimeout(resolve, 5));
      }
    }

    const finalPath = path.map((node) => ({ x: node.x, y: node.y } as Vector));
    this.search_duration = this.search_duration + new Date().getTime() - start_time;
    this.nodes_expanded = this.nodes_expanded + closedList.length + openList.length();
    this.searched = true;
    this.path = finalPath;
    if (animated) this.renderPath();
  }
}