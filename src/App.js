/* global YT */
import React, { Component } from 'react';
import { HashRouter, Switch, Route, Redirect } from 'react-router-dom';
import './App.css';
import Youtube from './Youtube.js';
import Subtitle from './Subtitle.js';
import Offset from './Offset.js';
import lrcParser from './lrcParser.js';
import defaultVid from './seishundokei.js';

class App extends Component {
  constructor() {
    super();
    this.state = {
      player: null,
      time: 0,
      timer: null,
      offset: 0,
      gisting: false,
    }
    this.setPlayer = this.setPlayer.bind(this);
    this.setTime = this.setTime.bind(this);
    this.setOffset = this.setOffset.bind(this);
    this.urlOnSet = this.urlOnSet.bind(this);
    this.fullOnClick = this.fullOnClick.bind(this);
    this.mergeOnClick = this.mergeOnClick.bind(this);
    this.gistOnClick = this.gistOnClick.bind(this);
    this.lrcOnChange = this.lrcOnChange.bind(this);
    this.onPlayerStateChange = this.onPlayerStateChange.bind(this);
    this.onTextKeyDown = this.onTextKeyDown.bind(this);
    this.getGist = this.getGist.bind(this);
  }
  render() {
    const params = this.props.match.params;
    const mode = params.mode==='view'?' view':'';
    return (
      <div className="flex">
        <div>
          <div className="url">
            <input
              type="textbox"
              className="videoUrl"
              ref="videoUrl"
              onClick={(e)=>e.target.select()}
            ></input>
            <button
              onClick={this.urlOnSet}
            >Set url</button>
          </div>
          <div className={"full"+mode}>
            <Youtube
              player={this.state.player}
              videoId={params.videoId}
              setPlayer={this.setPlayer}
              onPlayerReady={this.onPlayerReady}
              onPlayerStateChange={this.onPlayerStateChange}
            ></Youtube>
            <Subtitle
              sub={this.state.sub}
              time={this.state.time}
              offset={this.state.offset}
            ></Subtitle>
            <button
              onClick={this.fullOnClick}
            >Fullscreen</button>
          </div>
          <Offset
            offset={this.state.offset}
            setOffset={this.setOffset}
          ></Offset>
          <div>
            <button
              onClick={this.mergeOnClick}
            >Set to LRC</button>
            <button
              onClick={this.gistOnClick}
              disabled={this.state.gisting}
            >Save to Gist</button>
          </div>
        </div>
        <div>
          <textarea
            onChange={this.lrcOnChange}
            onKeyDown={this.onTextKeyDown}
            value={this.state.text}
            ref="text"
          ></textarea>
        </div>
      </div>
    );
  }
  getGist(id) {
    window.fetch(`https://api.github.com/gists/${id}`)
      .then((res)=>{
        if(!res.ok)
          throw new Error(res.statusText);
        return res.json();
      })
      .then(json=>{
        for(let i in json.files){
          if(json.files[i].truncated)//FIXME: fetch again from raw_url
            throw new Error('truncated!');
          this.setLrc(json.files[i].content);
          break;//FIXME: select from multiple files?
        }
      })
      .catch((e)=>{
        console.log(e);
        this.props.history.replace(`/y/${this.props.match.params.videoId}`);
      });
  }
  componentDidMount() {
    const params = this.props.match.params;
    this.refs.videoUrl.value = `https://www.youtube.com/watch?v=${params.videoId}`;
    if(params.offset){
      this.setOffset(parseFloat(params.offset));
    }
    if(params.gistId){
      this.getGist(params.gistId);
    }
  }
  componentWillReceiveProps(nextProps) {
    if ( this.props.match.params.gistId !== nextProps.match.params.gistId ) {
      this.getGist(nextProps.match.params.gistId);
    }
  }
  setOffset(s, e) {
    s = parseInt((s<0?s-0.05:s+0.05)*10, 10)/10;
    this.setState({ offset: s });
    if(e)
      this.props.history.replace(this.props.match.url.replace(/(\/[0-9\-.]+)(\/view)?$/, `/${s}$2`));
  }
  setLrc(t) {
    const parsed = lrcParser.parse(t);
    console.log(parsed);
    this.setState({ sub: parsed.lyrics, text: t});
  }
  lrcOnChange(e) {
    this.setLrc(e.target.value);
  }
  urlOnSet(e) {
    const url = e.target.previousSibling.value;
    if( /((https?:)?\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([^\s?]+)(.+)?/.test(url) ) {
      const videoId = url.replace(/((https?:)?\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([^\s?]+)(.+)?/, "$5");
      console.log(videoId);
      this.props.history.push(this.props.match.url.replace(/\/y\/[^/]+/, `/y/${videoId}`));
    }
  }
  fullOnClick() {
    if(document.webkitFullscreenElement) {
      const exit = document.exitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen;
      if (exit) {
        exit.call(document);
      }
    }
    else {
      const vid = document.querySelector('.full');
      const req = vid.requestFullscreen || vid.webkitRequestFullscreen || vid.mozRequestFullScreen || vid.msRequestFullscreen;
      if (req) {
        req.call(vid);
      }
    }
  }
  gistOnClick() {
    const videoId = this.props.match.params.videoId;
    this.setState({ gisting: true });
    window.fetch('https://api.github.com/gists', {
      method: 'POST',
      body: JSON.stringify({
        descripttion: `a subtitle in lrc format for https://www.youtube.com/watch?v=${videoId} created using https://hyww.github.io/Noti/`,
        public: false,
        files:{
          "file.lrc": {
            content: this.state.text
          }
        }
      })
    }).then((res)=>{
      if(!res.ok)
        throw new Error(res.statusText);
      return res.json();
    }).then(json=>{
      const params = this.props.match.params;
      this.props.history.push(`/y/${params.videoId}/g/${json.id}${params.offset?'/'+params.offset:''}`);
      this.setState({ gisting: false });
    }).catch((e)=>{
      alert('failed');
      console.log(e);
      this.setState({ gisting: false });
    });
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
  }
  onTextKeyDown(e) {
    const t = e.target;
    switch(e.keyCode){
      case 219: //'['
        if(e.ctrlKey) {
          const start = t.selectionStart;
          const end = t.selectionEnd;
          const value = t.value;
          this.setLrc(value.slice(0, start)+
            lrcParser.timestamp(this.state.time)
            +value.slice(end));
          setTimeout(()=>{t.selectionStart = t.selectionEnd = start+10;}, 50);
          e.preventDefault();
        }
        break;
      default:
    }
  }
  mergeOnClick() {
    this.setLrc( lrcParser.offset(this.state.text, this.state.offset));
    this.setOffset(0, true);
  }
}
const AppRouter = () => (
  <HashRouter>
    <Switch>
      <Route path="/y/:videoId/g/:gistId/:offset([0-9\-.]+)?/:mode(view)?" component={App} />
      <Route path="/y/:videoId" component={App} />
      <Redirect to={`/y/${defaultVid.videoId}/g/${defaultVid.gistId}/${defaultVid.offset}`} />
    </Switch>
  </HashRouter>
);
export default AppRouter;
