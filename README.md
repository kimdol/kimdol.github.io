# KIMDOL — Game & Web Developer

Unity, Unreal Engine, C++·DirectX, 웹·Android 및 학습 도구 프로젝트를 모은 개인 포트폴리오입니다.

- GitHub Pages: https://kimdol.github.io/
- 기존 ChatGPT Sites: https://kimdol-portfolio.rlagkd2451.chatgpt.site/

두 주소는 별도로 호스팅됩니다. 이 저장소를 수정해도 기존 Sites 배포본은 자동으로 바뀌지 않습니다.

## 프로젝트 추가·수정

`projects.json`에서 프로젝트 내용·링크·이미지 경로를 편집하고 `assets/projects/`에 이미지를 추가하세요. 기존 프로젝트의 필드를 복사하면 기술 필터·상세 화면·3D 포털에 함께 반영됩니다. 영상은 YouTube 링크를 사용합니다.

`studio.html`은 브라우저 내 초안 편집 도구입니다. JSON을 내보낸 뒤 이 저장소의 `projects.json`을 교체하고 커밋해야 공개 사이트에 반영됩니다.

## 로컬 확인

Node.js가 있으면 별도 패키지 설치 없이 실행할 수 있습니다.

```sh
npm run check
npm run dev
```

GitHub Pages 설정은 `main` 브랜치의 루트(`/`)를 게시하도록 구성합니다. HTML·CSS·JavaScript와 Three.js·폰트가 저장소에 포함되어 있으며 유료 API나 빌드 서비스가 필요하지 않습니다.

## 최신 Sites 소스에서 동기화

소스 폴더를 최신 Sites 버전으로 동기화한 뒤 다음 명령으로 공개 파일만 복사할 수 있습니다. 이 명령은 공개 홈페이지를 방문하지 않습니다.

```sh
node scripts/sync-from-sites.mjs --source "F:/DeveloperPortfolio/audit-v9"
npm run check
git add .
git commit -m "Update portfolio"
git push origin main
```

`--source`는 `.openai/hosting.json`과 `dist/`가 있는 최신 소스 폴더여야 합니다. 스크립트는 `dist/`만 복사하고 GitHub Pages의 canonical 주소를 유지합니다. Sites 쪽 배포는 별도입니다.

## 보관

GitHub의 **Code → Download ZIP** 또는 `git clone https://github.com/kimdol/kimdol.github.io.git`으로 로컬 사본을 보관할 수 있습니다. 무료 호스팅은 서비스 정책과 계정 상태에 따르며, 영구 제공을 보장하는 상품은 아닙니다.

자체 코드 라이선스는 `LICENSE`, 외부 라이브러리·폰트의 라이선스는 `THIRD-PARTY.md`와 각 자산의 라이선스 파일을 확인하세요. 프로젝트 화면·게임 및 팬 프로젝트 자산에는 해당 권리자의 권리가 적용됩니다.
