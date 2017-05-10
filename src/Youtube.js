/* global YT */
import React, { Component } from 'react';


class Youtube extends Component {
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
        height: '390',
        width: '640',
        videoId: props.videoId,
        events: {
          'onReady': props.onPlayerReady,
          'onStateChange': props.onPlayerStateChange
        }
      });
      props.setPlayer(player);
    }
  }
}
export default Youtube;
