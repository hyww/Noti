/* global YT */
import React, { Component } from 'react';


class Youtube extends Component {
  //FIXME only allows one player per page
  render() {
    return (
      <div id="player"></div>
    );
  }
  componentDidMount() {
    const props = this.props;
    // 2. This code loads the IFrame Player API code asynchronously.
    var tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    // 3. This function creates an <iframe> (and YouTube player)
    //    after the API code downloads.
    var player;
    window.onYouTubeIframeAPIReady = function() {
      player = new YT.Player('player', {
        videoId: props.videoId,
        playerVars: {fs: 0, loop:1, playsinline: 1},
        events: {
          'onReady': props.onPlayerReady,
          'onStateChange': props.onPlayerStateChange
        }
      });
      props.setPlayer(player);
    }
  }
  componentWillReceiveProps(nextProps) {
    if ( this.props.videoId !== nextProps.videoId ) {
      this.props.player.loadVideoById(nextProps.videoId);
    }
  }
}
export default Youtube;
