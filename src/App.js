/* global YT */
import React, { Component } from 'react';
import { HashRouter, Switch, Route, Redirect } from 'react-router-dom';
import createHistory from 'history/createBrowserHistory';
import ReactGA from 'react-ga';
import './App.css';
import Youtube from './Youtube.js';
import Subtitle from './Subtitle.js';
import Offset from './Offset.js';
import lrcParser from './lrcParser.js';
import defaultVid from './seishundokei.js';

ReactGA.initialize('UA-000000-01');
const history = createHistory();
history.listen((location, action) => {
  ReactGA.set({ page: window.location.pathname + window.location.hash });
  ReactGA.pageview(window.location.pathname + window.location.hash);
});

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
    this.setGistOnClick = this.setGistOnClick.bind(this);
    this.setGist = this.setGist.bind(this);
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
          <div className={"url edit"+mode}>
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
            mode={mode}
          ></Offset>
          <div className={"edit"+mode}>
            <button
              onClick={this.mergeOnClick}
            >Set to LRC</button>
            <button
              onClick={this.gistOnClick}
              disabled={this.state.gisting}
            >Save to Gist{this.state.gist?'':'(anonymous)'}</button>
            <button
              onClick={this.setGistOnClick}
            >Set Gist token</button>
          </div>
        </div>
        <div
          className={"edit"+mode}>
          <textarea
            onChange={this.lrcOnChange}
            onKeyDown={this.onTextKeyDown}
            value={this.state.text}
            ref="text"
            title="Ctrl+[ to insert timestamp"
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
    const gist = document.cookie.split(/[ ;]/).filter(a=>/^gist=/.test(a)).map(a=>a.replace(/^gist=/,''))[0];
    if(gist) {
      this.setGist(gist);
    }
    if(params.offset){
      this.setOffset(parseFloat(params.offset));
    }
    if(params.gistId){
      this.getGist(params.gistId);
    }
  }
  componentWillReceiveProps(nextProps) {
    if ( this.props.match.params.gistId !== nextProps.match.params.gistId && nextProps.match.params.gistId) {
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
      this.props.history.push(`/y/${videoId}`);
    }
  }
  fullOnClick() {
    if(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement) {
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
    const gistId = this.props.match.params.gistId;
    this.setState({ gisting: true });
    let options = {
      method: 'PATCH',
      body: JSON.stringify({
        description: `a subtitle in lrc format for https://www.youtube.com/watch?v=${videoId} created using https://hyww.github.io/Noti/`,
        public: false,
        files:{
          "file.lrc": {
            content: this.state.text
          }
        }
      })
    };
    if(this.state.gist){
      options.headers = {
        Authorization: `token ${this.state.gist}`,
      }
    }
    //FIXME: don't always try to PATCH
    window.fetch(`https://api.github.com/gists/${gistId}`, options).then((res)=>{
      if(!res.ok)
        throw new Error(res.statusText);
      return res.json();
    }).then(json=>{
      this.setState({ gisting: false });
    }).catch(()=>{
      options.method = 'POST';
      return window.fetch('https://api.github.com/gists', options)
      .then((res)=>{
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
    });
  }
  setGist(token) {
    let now = new Date();
    now.setTime(now.getTime()+ 120*24*60*60*1000);// 120 days later
    document.cookie = 'gist='+token+'; expires='+now.toGMTString();
    this.setState({ gist: token });
  }
  setGistOnClick() {
    const token = prompt('Personal access token for GitHub API:');
    if(token)
      this.setGist(token);
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
      case 39://right
        if(e.ctrlKey) {
          const time = this.state.time+5;
          this.state.player.seekTo(time, true);
          this.setState({ time });
          e.preventDefault();
        }
        break;
      case 37://left
        if(e.ctrlKey) {
          const time = this.state.time-5;
          this.state.player.seekTo(time, true);
          this.setState({ time });
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
