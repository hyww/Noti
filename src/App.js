/* global YT */
import React, { Component } from 'react';
import './App.css';
import Youtube from './Youtube.js'

class App extends Component {
  constructor() {
    super();
    this.setPlayer = this.setPlayer.bind(this);
  }
  render() {
    return (
      <Youtube
        videoId="g7rOyxIKsX8"
        setPlayer={this.setPlayer}
        onPlayerReady={this.onPlayerReady}
        onPlayerStateChange={this.onPlayerStateChange}
      ></Youtube>
    );
  }
  setPlayer(player) {
    this.setState({player});
    console.log(this.state.player);
  }
  onPlayerReady(event) {
    event.target.playVideo();
    event.target.done = false;
  }
  onPlayerStateChange(event) {
    // 5. The API calls this function when the player's state changes.
    //    The function indicates that when playing a video (state=1),
    //    the player should play for six seconds and then stop.
    function stopVideo() {
      event.target.stopVideo();
    }
    if (event.data === YT.PlayerState.PLAYING && !event.target.done) {
      setTimeout(stopVideo, 6000);
      event.target.done = true;
    }
  }
}

export default App;
