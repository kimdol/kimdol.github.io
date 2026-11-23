# KIMDOL — Game & Web Developer

Unity, Unreal Engine, C++·DirectX, 웹·Android 프로젝트를 모은 포트폴리오. 첫 화면에서 프로젝트를 기술별로 찾아보고, 아래 터널에서 각 프로젝트의 시연 화면을 볼 수 있다.

[포트폴리오](https://kimdol.github.io/) · [3D 터널](https://kimdol.github.io/#screening)

## 3D 터널

[portal.js](portal.js#L119)에서 스크롤 위치를 0~1 사이의 진행률로 바꾼다. 프로젝트마다 카메라가 빠르게 접근하고, 화면 앞에서 잠깐 감속한 뒤 포털을 통과한다. 통과할 때는 시야각이 넓어지고 링과 빛이 강해진다.

아래는 [프레임 갱신 코드](portal.js#L146)에서 카메라 이동만 발췌한 부분이다. `sample()`이 현재 위치와 다음 시선을 계산한다. 마지막 포털을 지나면 `cruise`가 쌓이고, 위치와 시선을 같은 거리만큼 전진시킨다.

```js
currentP = mix(currentP, targetP, 1 - Math.exp(-dt * 9))
const s = sample(currentP)
cruise = s.tail > 0 ? cruise + dt * 2.8 * smooth(s.tail) : 0
const drift = cruise * smooth(s.tail)

camera.position.set(s.x + px * .25, .3 + py * .18, s.z - drift)
camera.lookAt(s.lookX, 0, s.lookZ - drift)
```

기둥과 바닥 가로선, 링은 카메라를 기준으로 반복 배치한다. 마지막 작품 뒤에도 구조물이 앞으로 이어지고, 스크롤을 멈추면 카메라가 천천히 전진한다.

## 프로젝트 데이터

- [projects.json](projects.json) — 프로젝트 소개, 기술 스택, 담당 업무, 이미지, 영상 링크
- [assets/projects](assets/projects) — 대표 이미지와 갤러리
- [studio.html](https://kimdol.github.io/studio.html) — 프로젝트 초안 편집 및 JSON 내보내기

## 로컬 실행

```sh
npm run dev
npm run check
```

HTML, CSS, JavaScript, Three.js. GitHub Pages는 `main` 브랜치의 루트에서 배포한다.
