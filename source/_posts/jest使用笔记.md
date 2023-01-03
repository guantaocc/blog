---
title: jest使用笔记
cover: /assets/images/14316_46673790805.webp
tags: jest TDD
categories: 测试
---


# 使用jest测试工具函数

> https://jestjs.io/docs/getting-started

## 安装

### 使用 ts-jest

安装

```bash
yarn add typescript jest ts-jest @types/jest
```

<rootDir>/jest.config.js

```js
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
};
```

测试函数：<rootDir>/src/utils.ts

```ts
function pxToNumber(value: string | null): number {
  if(!value) return 0
  let match = value.match(/^\d*(\.\d*)?/)
  return match ? Number(match[0]): 0
}

export {
  pxToNumber
}
```

编写单元测试：<rootDir>/__tests__/utils.test.ts

```ts
import { describe, test, expect } from "@jest/globals"


import { pxToNumber } from "../src/utils"

describe('convert px to number', () => {
  test('if entry is null, return 0', () => {
    expect(pxToNumber(null)).toBe(0)
  })
  test('if entry is number, return a number', () => {
    expect(pxToNumber('33.5px')).toBe(33.5)
  })
})
```

## 测试异步函数

```ts
function testAsync(): Promise<Number> {
  return Promise.resolve(1)
}

// test
describe('test async functions', () => {
  test('test async result', async () => {
    let res = await testAsync()
    expect(res).toEqual(1)
  })
})
```


