import { Node } from './Node';

export class BinaryHeap {
  list: Node[];
  favorSelection: string;

  constructor(option: string) {
    this.list = [];
    this.favorSelection = option;
  }

  heapify = (smallestIndex: number) => {
    let smallest = smallestIndex;
    const left = 2 * smallestIndex + 1;
    const right = 2 * smallestIndex + 2;

    if (left < this.list.length && this.list[left].f <= this.list[smallest].f) {
      if (this.favorSelection === 'greater' && this.list[left].g >= this.list[smallest].g)
        smallest = left;

      if (this.favorSelection === 'smaller' && this.list[left].g <= this.list[smallest].g)
        smallest = left;

      if (this.favorSelection === 'none')
        smallest = left;
    }

    if (right < this.list.length && this.list[right].f <= this.list[smallest].f) {
      if (this.favorSelection === 'greater' && this.list[right].g >= this.list[smallest].g)
        smallest = right;

      if (this.favorSelection === 'smaller' && this.list[right].g <= this.list[smallest].g)
        smallest = right;

      if (this.favorSelection === 'none')
        smallest = right;
    }

    if (smallest !== smallestIndex) {
      const temp = this.list[smallestIndex];
      this.list[smallestIndex] = this.list[smallest];
      this.list[smallest] = temp;

      // Recursively heapify the child trees
      this.heapify(smallest);
    }
  }

  insert(node: Node) {
    const size = this.list.length;

    if (size === 0) {
      this.list.push(node);
      return;
    }

    if (this.list.find((n) => n.key === node.key)) return;

    this.list.push(node);
    for (let i = Math.floor(this.list.length/2 - 1); i >= 0; i--) {
      this.heapify(i);
    }
  }

  delete(node: Node) {
    const size = this.list.length;
    const nodeToRemove = this.list.findIndex((n) => n.key === node.key);

    // Swap the node with last element
    const temp = this.list[size - 1];
    this.list[size - 1] = this.list[nodeToRemove];
    this.list[nodeToRemove] = temp;

    // Remove the last element
    this.list.pop();
    
    for (let i = Math.floor(this.list.length/2 - 1); i >= 0; i--) {
      this.heapify(i);
    }
  }

  getMin() {
    return this.list[0];
  }

  has(node: Node) {
    const exists = this.list.find((n) => n.key === node.key);

    return exists ? true : false;
  }

  pop() {
    const smallest = this.list[0];
    this.delete(smallest);
    return smallest;
  }

  length() {
    return this.list.length;
  }

  getList() {
    return this.list;
  }
}