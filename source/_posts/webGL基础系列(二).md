---
title: webgl基础二(多个点,线，面)
cover: /assets/images/232947_18714716152.webp
tags: webgl
categories: webgl
---


## 绘制 多个 点 - 线 - 面

webgl可以整合多个点 组合成 点，线，面等效果，这个和我们在一中 多次 render绘制时候是不一样的


### 绘制多个点

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>绘制点</title>
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

    // 设置了 三个顶点
    const vertices = new Float32Array([
      0.0, 0.1,
      -0.1, -0.1,
      0.1, -0.1
    ])

    // 建立 buffer
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)


    // 获取 顶点变量
    const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
    const a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize')

    // 每两个值 为一个点
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0)

    gl.enableVertexAttribArray(a_Position)

    gl.vertexAttrib1f(a_PointSize, 10)

    gl.clearColor(0, 0, 0, 1)
    // 用上面指定的颜色清除缓冲区
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 画出 3个点
    gl.drawArrays(gl.POINTS, 0, 3)

  </script>
</body>

</html>
```

### 画出三角面

- 去除点定义

```diff
    attribute vec4 a_Position; // 顶点变量
-    attribute float a_PointSize;
    void main(){
      gl_Position = a_Position; // webgl坐标系 x, y, z
-      gl_PointSize = a_PointSize;
    }
```

- 修改面定义

```diff

- 
- gl.drawArrays(gl.POINTS, 0, 3)
+ gl.drawArrays(gl.TRIANGLES, 0, 3)

```

### 绘制各种支持线

drawArrays的类型:

// LINES 线 
// LINE_LOOP  闭合线条
// LINE_STRIPE 连接线条
// TRIANGLES 三角形，有正反面之分
// TRIANGLE_STRIP 三角带
// TRIANGLE_FAN 三角扇

> 
1. TRIANGLE_STRIP 绘制顺序，奇数三角形以第二条边的相反方向绘制, 偶数则以第三条边相反方向绘制
2. TRIANGLE_FAN 绘制顺序, 以第三条边相反的顺序 + 下一个点绘制


### 绘制矩形面

通过 左上，左下，右上，右下顺序绘制


### 异步绘制

缓冲区 bufferData 绑定 中的数据可以方便异步绘制 webgl上下文每次会清空 缓冲区数据，
我们只需要修改缓冲区中的数据即可

```js

setTimeout(() => {
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
}, 1000)

```


## 图形转换面的场景



