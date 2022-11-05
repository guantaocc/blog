---
title: webgl基础(初始化，转换坐标系，基础shader)
cover: /assets/images/fstv4630juwkb5iwyocs5gewxkla.webp
tags: webgl
categories: webgl
---

> 源码查看: https://github.com/guantaocc/webgl-learning-code

## webgl初始

> 关于转换 color 的库可用 threejs 的 color库

```js
import { color } from 'https://unpkg.com/three@0.146.0/build/three.module.js'
```

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>webGL 起步</title>
  <style>
    body,html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100vh;
    }
  </style>
</head>
<body>
  <canvas id="canvas"></canvas>
  <script>
    const canvas = document.getElementById("canvas")
    const gl = canvas.getContext('webgl')
    // webgl 颜色
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    // css string 转换 webgl颜色
    // rgba(255, 255, 255, 1)

    function toGlColor(cssString){
      let reg = new RegExp(/\((.*)\)/)
      let str = reg.exec(cssString)[1]
      let rgb = str.split(',').map(item => parseInt(item))
      
      return rgb.map((item, index) => {
        if(index === rgb.length - 1) return
        return item / 255
      })

    } 
    gl.clearColor(...toGlColor('rgba(0, 0, 0, 1)'))
    // 用上面指定的颜色清除缓冲区
    gl.clear(gl.COLOR_BUFFER_BIT);
  </script>
</body>
</html>
```

## webgl 屏幕坐标转换 webgl坐标


坐标系 x 朝右为正，朝上为负, 半个canvas画布宽高为一个 单位

<img src="/post_images/webgl坐标系.png"></img>

屏幕坐标转换 webgl坐标
<img src="/post_images/webgl屏幕坐标系转换.png"></img>


```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>屏幕坐标系转换</title>
  <style>
    body {
      padding-top: 50px;
      text-align: center;
    }
  </style>
</head>
<body>
  <canvas id="canvas"></canvas>
  <script>
    const canvas = document.getElementById("canvas")
    canvas.width = 600
    canvas.height = 400
    const gl = canvas.getContext('webgl')

    function translateCord(canvas, point){
      // 鼠标相对屏幕坐标系
      let { x, y} = point
      console.log('屏幕坐标', x, y)
      let { width, height, left, top } = canvas.getBoundingClientRect()
      // 相对坐标
      let mouseVec = [x, y]
      let canvasVec = [left, top]
      let coord = [x - left, y - top]

      function unitWidth(e){
        return (e - width / 2) / (width / 2)
      }
      function unitHeight(e){
        return (e - height / 2) / (height / 2)
      }
      // 获取相对坐标 并将 y取反
      let glPoint = {
        x: unitWidth(coord[0]),
        y: -unitHeight(coord[1])
      }
      console.log('webgl坐标', glPoint.x, glPoint.y)
    }

    canvas.addEventListener('click', function (e){
      translateCord(canvas, { x: e.clientX, y: e.clientY})
    })

    gl.clearColor(0, 0, 0, 1)
    // 用上面指定的颜色清除缓冲区
    gl.clear(gl.COLOR_BUFFER_BIT);
  </script>
</body>
</html>
```