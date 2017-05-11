/* global YT */
import React, { Component } from 'react';
import './App.css';
import Youtube from './Youtube.js'
import Subtitle from './Subtitle.js'
import lrcParser from './lrcParser.js'
import defaultVid from './seishundokei.js'

class App extends Component {
  constructor() {
    super();
    this.state = {
      player: null,
      videoId: defaultVid.videoId,
      videoUrl: `https://www.youtube.com/watch?v=${defaultVid.videoId}`,
      time: 0,
      timer: null,
    }
    this.setPlayer = this.setPlayer.bind(this);
    this.setTime = this.setTime.bind(this);
    this.urlOnSet = this.urlOnSet.bind(this);
    this.lrcOnChange = this.lrcOnChange.bind(this);
    this.onPlayerStateChange = this.onPlayerStateChange.bind(this);
  }
  render() {
    return (
      <div className="flex">
        <div>
          <input
            type="textbox"
            ref="videoUrl"
            onClick={(e)=>e.target.select()}
          ></input>
          <button
            onClick={this.urlOnSet}
          >Set url</button>
        </div>
        <Youtube
          player={this.state.player}
          videoId={this.state.videoId}
          videoUrl={this.state.videoUrl}
          setPlayer={this.setPlayer}
          onPlayerReady={this.onPlayerReady}
          onPlayerStateChange={this.onPlayerStateChange}
        ></Youtube>
        <Subtitle
          sub={this.state.sub}
          time={this.state.time}
        ></Subtitle>
        <textarea
          onChange={this.lrcOnChange}
          ref="text"
          value={defaultVid.lrc}
        ></textarea>
      </div>
    );
  }
  componentDidMount() {
    this.setLrc(this.refs.text.value);
    this.refs.videoUrl.value = this.state.videoUrl;
  }
  setLrc(t) {
    const parsed = lrcParser(t);
    console.log(parsed);
    this.setState({ sub: parsed.lyrics});
  }
  lrcOnChange(e) {
    this.setLrc(e.target.value);
  }
  urlOnSet(e) {
    const url = e.target.previousSibling.value;
    if( /((https?:)?\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)(\w+)(.+)?/.test(url) ) {
      const videoId = url.replace(/((https?:)?\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)(\w+)(.+)?/, "$5");
      console.log(videoId);
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
    if (event.data === YT.PlayerState.PLAYING && this.state.timer===null) {
      const timer = setInterval(this.setTime, 50);
      this.setState({ timer});
    }
    else {
      // FIXME may setstate twice here
      this.setState({ time: this.state.player.getCurrentTime() });
      if(this.state.timer !== null) {
        clearInterval(this.state.timer);
        this.setState({timer: null});
      }
    }
  }
  setTime() {
    this.setState({ time: this.state.player.getCurrentTime() });
    console.log(this.state.time);
  }
}

export default App;
