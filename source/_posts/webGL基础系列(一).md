---
title: webgl基础一(初始化，转换坐标系，基础shader画点，基本动画)
cover: /assets/images/fstv4630juwkb5iwyocs5gewxkla.webp
tags: webgl
categories: webgl
---

> 源码查看: https://github.com/guantaocc/webgl-learning-code
openGl glsl文档: https://registry.khronos.org/OpenGL-Refpages/gl4/



> 关于 threejs 的 color库

```js
import { color } from 'https://unpkg.com/three@0.146.0/build/three.module.js'
```


## webgl初始

初始化webgl画布

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

## shader基础

> 理论参考: https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-fundamentals.html


### webgl使用并连接 shader着色器 绘制一个点


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
  <!-- 顶点着色器 -->
  <script id="vertexShader" type="x-shader/x-vertex">
    void main(){
      gl_Position = vec4(0.0, 0.0, 0.0, 1.0); // webgl坐标系 x, y, z
      gl_PointSize = 10.0;
    }
  </script>
  <!-- 片元着色器 -->
  <script id="fragmentShader" type="x-shader/x-fragment">
    void main(){
      gl_FragColor = vec4(1, 1, 0, 1);
    }
  </script>
  <script>
    const canvas = document.getElementById("canvas")
    canvas.width = 600
    canvas.height = 400
    const gl = canvas.getContext('webgl')

    // 创建着色器方法，输入参数：渲染上下文，着色器类型，数据源
    function createShader(gl, type, source) {
      var shader = gl.createShader(type); // 创建着色器对象
      gl.shaderSource(shader, source); // 提供数据源
      gl.compileShader(shader); // 编译 -> 生成着色器
      var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
      if (success) {
        // 编译成功，返回 shader
        return shader;
      }
      console.log(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
    }

    var vertexShaderSource = document.getElementById("vertexShader").innerText;
    var fragmentShaderSource = document.getElementById("fragmentShader").innerText;

    // 创建顶点和片元着色器
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    function createProgram(gl, vertexShader, fragmentShader) {
      var program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      gl.useProgram(program)

      gl.program = program
      return program
    }

    // 连接到着色器程序
    var program = createProgram(gl, vertexShader, fragmentShader);

    console.log(program)



    gl.clearColor(0, 0, 0, 1)
    // 用上面指定的颜色清除缓冲区
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 绘制顶点
    gl.drawArrays(gl.POINTS, 0, 1)


  </script>
</body>

</html>
```

### 使用着色器变量

根据鼠标位置 绘制不同大小的点，需要我们改变着色器的位置和颜色, 这时需要获取 shader中的变量

> 注意: 每个线程 drawArrays 都会清空缓冲区中的内容(清空画布), 如果在异步方法中进行绘制，需要保存我们绘制的点的信息

例子: 根据 鼠标绘制不同颜色的点

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>shader attributes</title>
  <style>
    body {
      padding-top: 50px;
      text-align: center;
    }
  </style>
</head>

<body>
  <canvas id="canvas"></canvas>
  <!-- 顶点着色器 -->
  <script id="vertexShader" type="x-shader/x-vertex">
    attribute vec4 a_Position; // 顶点变量
    attribute float a_PointSize;
    void main(){
      gl_Position = a_Position; // webgl坐标系 x, y, z
      gl_PointSize = a_PointSize;
    }
  </script>
  <!-- 片元着色器 -->
  <script id="fragmentShader" type="x-shader/x-fragment">
    precision mediump float;
    uniform vec4 u_FragColor;
    void main(){
      gl_FragColor = u_FragColor;
    }
  </script>
  <script>
    const canvas = document.getElementById("canvas")
    canvas.width = 600
    canvas.height = 400
    const gl = canvas.getContext('webgl')

    // 创建着色器方法，输入参数：渲染上下文，着色器类型，数据源
    function createShader(gl, type, source) {
      var shader = gl.createShader(type); // 创建着色器对象
      gl.shaderSource(shader, source); // 提供数据源
      gl.compileShader(shader); // 编译 -> 生成着色器
      var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
      if (success) {
        // 编译成功，返回 shader
        return shader;
      }
      console.log(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
    }

    var vertexShaderSource = document.getElementById("vertexShader").innerText;
    var fragmentShaderSource = document.getElementById("fragmentShader").innerText;

    // 创建顶点和片元着色器
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    function createProgram(gl, vertexShader, fragmentShader) {
      var program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      gl.useProgram(program)

      gl.program = program
      return program
    }

    // 连接到着色器程序
    var program = createProgram(gl, vertexShader, fragmentShader);

    console.log(program)

    // 存储 所有 points
    const glPoints = []

    // 获取 顶点变量
    const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
    const a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize')
    const u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor')

    gl.clearColor(0, 0, 0, 1)
    // 用上面指定的颜色清除缓冲区
    gl.clear(gl.COLOR_BUFFER_BIT);

    function translateCord(canvas, point) {
      // 鼠标相对屏幕坐标系
      let { x, y } = point
      console.log('屏幕坐标', x, y)
      let { width, height, left, top } = canvas.getBoundingClientRect()
      // 相对坐标
      let mouseVec = [x, y]
      let canvasVec = [left, top]
      let coord = [x - left, y - top]

      function unitWidth(e) {
        return (e - width / 2) / (width / 2)
      }
      function unitHeight(e) {
        return (e - height / 2) / (height / 2)
      }
      // 获取相对坐标 并将 y取反
      let glPoint = {
        x: unitWidth(coord[0]),
        y: -unitHeight(coord[1])
      }
      console.log('webgl坐标', glPoint.x, glPoint.y)
      return glPoint
    }

    canvas.addEventListener('click', function (e) {
      let loc = translateCord(canvas, { x: e.clientX, y: e.clientY })
      const size = 10 * Math.random() + 10

      const color = [0, 0, 0].map(() => {
        return Math.random()
      })

      gl.clear(gl.COLOR_BUFFER_BIT);

      glPoints.push({ ...loc, size: size, color })

      glPoints.forEach(vec => {
        // 修改变量
        let { x, y, size, color } = vec
        // 改变点颜色
        gl.uniform4f(u_FragColor, ...color, 1)
        // 改变位置和大小
        gl.vertexAttrib3f(a_Position, x, y, 0.0)
        gl.vertexAttrib1f(a_PointSize, size)

        // 绘制顶点
        gl.drawArrays(gl.POINTS, 0, 1)
      })
    })


  </script>
</body>

</html>
```

### 改变片元着色器 画一个圆点

```html
<!-- 片元着色器 -->
<script id="fragmentShader" type="x-shader/x-fragment">
  precision mediump float;
  uniform vec4 u_FragColor;
  void main(){
    // 画片元的圆点, 计算片元 距离中心点距离相同则绘制
    float dist = distance(gl_PointCoord, vec2(0.5, 0.5));
    if(dist < 0.5){
      gl_FragColor = u_FragColor;
    }else {
      discard; // 跳过不绘制
    }
  }
</script>
```


### 如何改变片元着色器的透明度(片元合成)


如果透明度也是随机值时，需要 alpha开启 片元合成

```js
gl.enable(gl.BLEND)

// 设置合成方式(透明度合成)
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
```


### 根据时间的补间动画


补间动画架构，根据关键帧改变 圆点透明度

```js
// 简单补间动画

// 管理对象状态
class Compose {
  constructor() {
    this.parent = null
    this.children = []
  }
  add(obj) {
    obj.parent = this
    this.children.push(obj)
  }
  update(t) {
    this.children.forEach(child => {
      child.update(t)
    })
  }
}


function getValBetweenFms(time, fms, last) {
  // 第一个帧和 最后一个帧的补间状态
  for (let i = 0; i < last; i++){
    const fm1 = fms[i]
    const fm2 = fms[i + 1]
    if (time >= fm1[0] && time <= fm2[0]) {
      // 向量
      const delta = {
        x: fm2[0] - fm1[0],
        y: fm2[1] - fm1[1]
      }
      const k = delta.y / delta.x
      const b = fm1[1] - fm1[0] * k
      return k*time + b
    }
  }
}

// 时间轨道 t
class Track {
  constructor(target) {
   this.target = target
   this.parent = null
    this.start = 0
    this.timelen = 5
    this.loop = false
    // 关键帧
    this.keyMap = new Map()
  }
  update(t) {
    const { keyMap, timelen, target, loop } = this
    let time = t - this.start
    if (loop) {
      time = time % timelen
    }
    for (const [key, fms] of keyMap.entries()) {
      const last = fms.length - 1
      if (time < fms[0][0]) {
        // 小于第一个帧时间
        target[key] = fms[0][1]
      } else if (time > fms[last][0]) {
        // 大于最后一个帧时间
        target[key] = fms[last][1]
      } else {
        target[key] = getValBetweenFms(time, fms, last)
      }
    }
  }
}

```

基于上面进行圆点透明度的改变

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>shader attributes</title>
  <style>
    body {
      padding-top: 50px;
      text-align: center;
    }
  </style>
</head>

<body>
  <script src="../lib/animation.js"></script>
  <canvas id="canvas"></canvas>
  <!-- 顶点着色器 -->
  <script id="vertexShader" type="x-shader/x-vertex">
    attribute vec4 a_Position; // 顶点变量
    attribute float a_PointSize;
    void main(){
      gl_Position = a_Position; // webgl坐标系 x, y, z
      gl_PointSize = a_PointSize;
    }
  </script>
  <!-- 片元着色器 -->
  <script id="fragmentShader" type="x-shader/x-fragment">
    precision mediump float;
    uniform vec4 u_FragColor;
    void main(){
      // 画片元的圆点, 计算片元 距离中心点距离相同则绘制
      float dist = distance(gl_PointCoord, vec2(0.5, 0.5));
      if(dist < 0.5){
        gl_FragColor = u_FragColor;
      }else {
        discard; // 跳过不绘制
      }
    }
  </script>
  <script>
    const canvas = document.getElementById("canvas")
    canvas.width = 600
    canvas.height = 400
    const gl = canvas.getContext('webgl')

    // 创建着色器方法，输入参数：渲染上下文，着色器类型，数据源
    function createShader(gl, type, source) {
      var shader = gl.createShader(type); // 创建着色器对象
      gl.shaderSource(shader, source); // 提供数据源
      gl.compileShader(shader); // 编译 -> 生成着色器
      var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
      if (success) {
        // 编译成功，返回 shader
        return shader;
      }
      console.log(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
    }

    var vertexShaderSource = document.getElementById("vertexShader").innerText;
    var fragmentShaderSource = document.getElementById("fragmentShader").innerText;

    // 创建顶点和片元着色器
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    function createProgram(gl, vertexShader, fragmentShader) {
      var program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      gl.useProgram(program)

      gl.program = program
      return program
    }

    // 连接到着色器程序
    var program = createProgram(gl, vertexShader, fragmentShader);

    console.log(program)

    // 存储 所有 points
    const glPoints = []

    // 获取 顶点变量
    const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
    const a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize')
    const u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor')

    gl.clearColor(0, 0, 0, 1)
    // 用上面指定的颜色清除缓冲区
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enable(gl.BLEND)

    // 设置合成方式(透明度合成)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    function translateCord(canvas, point) {
      // 鼠标相对屏幕坐标系
      let { x, y } = point
      console.log('屏幕坐标', x, y)
      let { width, height, left, top } = canvas.getBoundingClientRect()
      // 相对坐标
      let mouseVec = [x, y]
      let canvasVec = [left, top]
      let coord = [x - left, y - top]

      function unitWidth(e) {
        return (e - width / 2) / (width / 2)
      }
      function unitHeight(e) {
        return (e - height / 2) / (height / 2)
      }
      // 获取相对坐标 并将 y取反
      let glPoint = {
        x: unitWidth(coord[0]),
        y: -unitHeight(coord[1])
      }
      console.log('webgl坐标', glPoint.x, glPoint.y)
      return glPoint
    }

    const compose = new Compose()

    // 渲染
    function render() {
      gl.clear(gl.COLOR_BUFFER_BIT);
      glPoints.forEach(vec => {
        // 修改变量
        let { x, y, size, a } = vec
        gl.uniform4fv(u_FragColor, new Float32Array([0.87, 0.92, 1, a]))
        gl.vertexAttrib3f(a_Position, x, y, 0.0)
        gl.vertexAttrib1f(a_PointSize, size)
        // 绘制顶点
        gl.drawArrays(gl.POINTS, 0, 1)
      })
    }

    //
    ; (function renderAnimate() {
      compose.update(new Date())
      render()
      requestAnimationFrame(renderAnimate)
    })()

    canvas.addEventListener('click', function (e) {
      let loc = translateCord(canvas, { x: e.clientX, y: e.clientY })
      const size = 10 * Math.random() + 10

      let a = 1

      let obj = { ...loc, size: size, a }

      glPoints.push(obj)

      // 建立动画轨道对象
      const track = new Track(obj)


      track.start = new Date()
      // 关键帧
      track.keyMap = new Map([
        [
          'a', [
            [500, a],
            [1000, 0],
            [1500, a]
          ]
        ]
      ])

      track.timelen = 2000
      track.loop = true

      compose.add(track)

      // render()
    })
  </script>
</body>

</html>
```