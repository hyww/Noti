/* global YT */
import React, { Component } from 'react';
import './App.css';
import Youtube from './Youtube.js'

class App extends Component {
  constructor() {
    super();
    this.state = {
      player: null,
      videoId: "g7rOyxIKsX8",
    }
    this.setPlayer = this.setPlayer.bind(this);
    this.urlOnSet = this.urlOnSet.bind(this);
  }
  render() {
    return (
      <div>
        <input
          type="textbox"
        ></input>
        <button
          onClick={this.urlOnSet}
        >Set url</button>
        <Youtube
          player={this.state.player}
          videoId={this.state.videoId}
          videoUrl={this.state.videoUrl}
          setPlayer={this.setPlayer}
          onPlayerReady={this.onPlayerReady}
          onPlayerStateChange={this.onPlayerStateChange}
        ></Youtube>
      </div>
    );
  }
  urlOnSet(e) {
    const url = e.target.previousSibling.value;
    if( /((https?:)?\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)(\w+)(.+)?/.test(url) ) {
      const videoId = url.replace(/((https?:)?\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)(\w+)(.+)?/, "$5");
      this.setState({videoId});
    }
  }
  setPlayer(player) {
    this.setState({player});
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
