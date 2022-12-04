import React, {useState} from "react";

import './Playground.css';

class LinkedListNode {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}

class LinkedList {
    constructor(value) {
        const node = new LinkedListNode(value);
        this.head = node;
        this.tail = node;
    }
}
const size = 10;

const Playground = () => {
    const [board, setBoard] = useState(
        new Array(size).fill(0).map(row => new Array(size).fill((0))),
    );

    return(
        <div className="playground">
            {board.map((row, rowId) => (
                <div key={rowId} className="row">{
                    row.map((cell, cellId) => (
                        <div key={cellId} className={`cell ${false ? 'snake-cell': ''}`}></div>
                    ))
                }</div>
            ))}
        </div>
    );
}

export default Playground;