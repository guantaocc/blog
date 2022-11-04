---
title: 'node 转换rtsp视频流并转换flv格式在前端播放'
cover: /assets/images/bg1.webp
tags: 流媒体
categories: 流媒体
---


## server端

### 下载依赖库

```bash

npm install express express-ws fluent-ffmpeg websocket-stream/stream

```

### 使用websocket 和 ffmpeg 转换流

```js
const express = require("express");
const expressWebSocket = require("express-ws");
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath("D:/ffmpeg-5.1.2/bin/ffmpeg");
const webSocketStream = require("websocket-stream/stream");

function loadServer() {
  let app = express();
  app.use(express.static(__dirname));
  expressWebSocket(app, null, {
    perMessageDeflate: true,
  });
  // id 为每个路由的 视频路径
  app.ws("/rtsp/:id/", rtspRequestHandle);
  app.listen(3000);
  console.log("express listened");
}

function rtspRequestHandle(ws, req) {
  console.log("rtsp request handle");
  const stream = webSocketStream(
    ws,
    {
      binary: true,
      browserBufferTimeout: 1000000,
    },
    {
      browserBufferTimeout: 1000000,
    }
  );
  let url = req.query.url;
  console.log("rtsp url", url);
  try {
    ffmpeg(url)
      .addInputOption("-rtsp_transport", "tcp", "-buffer_size", "102400")
      .on("start", function () {
        console.log(url, "Stream started.");
      })
      .on("codecData", function () {
        console.log(url, "Stream codecData.");
        // 摄像机在线处理
      })
      .on('progress', (data) => {
        // console.log('progress', data)
      })
      .on("error", function (err) {
        console.log(url, "An error occured: ", err.message);
      })
      .on("end", function () {
        console.log(url, "Stream end!");
        // 摄像机断线的处理
      })
      .outputFormat("flv")
      .videoCodec("libx264")
      .noAudio()
      .pipe(stream);
  } catch (error) {}
}

loadServer();
```

## client端

node 启动 server端

### 下载 flv.js

```bash

npm install flv.js

```

### 编写Vue组件

FlvPlayer.vue

```html
<template>
  <div class="video-box">
    <video controls="controls" class="demo-video" ref="player" muted></video>
  </div>
</template>

<script>
import flvjs from "flv.js";
export default {
  name: "FlvPlayer",
  data() {
    return {
      player: null,
      loading: true,
    };
  },
  props: {
    id: {
      type: Number,
      default: 0
    }
  },
  mounted() {
    this.playVideo();
  },
  methods: {
    playVideo() {
      const time1 = new Date().getTime();
      if (flvjs.isSupported()) {
        let video = this.$refs.player;
        if (video) {
          this.player = flvjs.createPlayer({
            type: "flv",
            isLive: true,
            hasAudio: false,
            url: `ws://192.168.1.198:3000/rtsp/${this.id}?url=rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4`,
          });
          this.player.attachMediaElement(video);
          this.player.load();
          this.player.play().then(() => {
            console.log(new Date().getTime() - time1);
            this.loading = false;
          });
        }
      }
    },
    beforeDestroy() {
      if (this.player) {
        this.player.unload();
        this.player.destroy();
        this.player = null;
      }
    },
  },
};
</script>

<style lang="less" scoped>
.video-box {
  width: 600px;
  height: 400px;
  video {
    width: 100%;
    height: 100%;
    object-fit: fill;
  }
}
</style>
```

### 显示播放器

App.vue

```html
<template>
  <div id="app">
    <FlvPlayer :id="1" />
    <FlvPlayer :id="2" />
    <FlvPlayer :id="3"/>
    <FlvPlayer :id="4"/>
    <FlvPlayer :id="5"/>
    <FlvPlayer :id="6"/>
    <FlvPlayer :id="7"/>
    <FlvPlayer :id="8"/>
    <FlvPlayer :id="9"/>
    <FlvPlayer :id="10"/>
  </div>
</template>
<script>
import FlvPlayer from '@/components/FlvPlayer'
export default {
  components: {
    FlvPlayer
  }
}
</script>
<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
```

## 源码(github)

源码地址: [github](https://github.com/guantaocc/rtsp-flv).