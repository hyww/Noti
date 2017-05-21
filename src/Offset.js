import React, { Component } from 'react';

class Offset extends Component {
  constructor() {
    super()
    this.decrease = this.decrease.bind(this);
    this.increase = this.increase.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onBlur = this.onBlur.bind(this);
  }
  render() {
    return (
      <div className="offset">
        <button
          onClick={this.decrease}
        >－</button>
        <input
          type="textbox"
          value={this.props.offset}
          onKeyDown={this.onKeyDown}
          onBlur={this.onBlur}
        ></input>
        <button
          onClick={this.increase}
        >＋</button>
      </div>
    )
  }
  decrease(e) {
    this.props.setOffset(this.props.offset-0.1, e);
  }
  increase(e) {
    this.props.setOffset(this.props.offset+0.1, e);
  }
  onKeyDown(e) {
    switch(e.keyCode){
      case 38://up
      case 39://right
        this.increase();
        break;
      case 40://down
      case 37://left
        this.decrease();
        break;
      default:
    }
  }
  onBlur(e) {
    this.props.setOffset(this.props.offset, e);
  }
}

export default Offset

