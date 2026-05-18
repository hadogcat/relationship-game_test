import React, { useMemo, useState } from "react";

const INITIAL_STATS = {
  over: 50,
  affection: 50,
  self: 50,
  dignity: 50,
};

const INITIAL_MESSAGE =
  "나는 오늘 상대의 작은 반응에도 의미를 찾고 있었다. 아직 아무 일도 일어나지 않았지만, 마음은 이미 여러 방향으로 흔들리고 있다. 이 게임은 상대의 답장보다 내 감정이 어떻게 움직이는지를 따라가는 기록이다.";

const DEFAULT_PLAYER = {
  gender: "female",
  myName: "",
  targetName: "",
  relationship: "썸",
  contactStyle: "불안형",
  sensitivity: "높음",
};

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};

const scenes = [
  {
    id: 0,
    time: "PM 8:12",
    title: "퇴근 후 첫 카톡",
    situation: ({ targetName }) => `${targetName}에게 '오늘 고생했어 ㅋㅋ'라고 보냈다. 읽음은 떴는데 17분째 답장이 없다.`,
    messages: () => [
      { who: "me", text: "오늘 고생했어 ㅋㅋ" },
      { who: "system", text: "읽음 1" },
    ],
    choices: [
      { text: "아무 일 아닌 척 기다린다", result: "괜찮은 척했지만 머릿속에서는 이미 답장 시나리오가 12개쯤 생성됐다.", effects: { over: 12, affection: 2, self: -2, dignity: 4 } },
      { text: "'바쁜가보네 ㅋㅋ'라고 추가로 보낸다", result: "추가 메시지를 보내자마자 후회가 밀려온다. 너무 신경 쓰는 사람처럼 보였을까?", effects: { over: 22, affection: 5, self: -8, dignity: -4 } },
      { text: "핸드폰을 내려놓고 씻으러 간다", result: "물소리 덕분에 생각이 잠깐 끊겼다. 답장은 아직 없지만 내 리듬은 조금 돌아왔다.", effects: { over: -10, affection: 0, self: 8, dignity: 8 } },
    ],
  },
  {
    id: 1,
    time: "PM 8:47",
    title: "답장 도착",
    situation: "드디어 답장이 왔다. 그런데 내용은 짧다. 'ㅋㅋ 너도'",
    messages: () => [{ who: "target", text: "ㅋㅋ 너도" }],
    choices: [
      { text: "짧아도 답장 온 거니까 좋게 본다", result: "마음이 잠깐 풀린다. 그래도 말투가 왜 이렇게 짧은지는 계속 신경 쓰인다.", effects: { over: 8, affection: 8, self: 0, dignity: 2 } },
      { text: "나도 짧게 '응ㅋㅋ'만 보낸다", result: "나름 균형을 맞춘 것 같지만, 대화가 여기서 끝날까 봐 또 신경 쓰인다.", effects: { over: 15, affection: 1, self: -2, dignity: 5 } },
      { text: "대화를 이어가려고 질문한다", result: "질문을 던졌다. 이제 또 기다림의 게임이 시작됐다.", effects: { over: 20, affection: 10, self: -5, dignity: -2 } },
    ],
  },
  {
    id: 2,
    time: "PM 9:22",
    title: "단톡방 변수",
    situation: ({ targetName }) => `${targetName}은 내 개인톡에는 답장이 느린데, 단톡방에는 방금 농담을 남겼다.`,
    messages: ({ targetName }) => [{ who: "group", text: `${targetName}: 아 오늘 너무 심심하다 ㅋㅋ` }],
    choices: [
      { text: "단톡방에 자연스럽게 반응한다", result: "아무렇지 않은 척 반응했다. 겉으로는 평온하지만 속은 살짝 찌릿하다.", effects: { over: 18, affection: 5, self: -3, dignity: 3 } },
      { text: "일부러 아무 반응도 안 한다", result: "반응하지 않으니 자존심은 지킨 것 같지만, 오히려 더 그의 반응을 기다리게 된다.", effects: { over: 24, affection: -2, self: -5, dignity: 8 } },
      { text: "내가 서운했다는 사실만 조용히 인정한다", result: "'아, 나 지금 서운했구나.' 그 한 문장이 생각의 속도를 조금 늦춘다.", effects: { over: -15, affection: 0, self: 12, dignity: 10 } },
    ],
  },
  {
    id: 3,
    time: "PM 9:48",
    title: "스토리 확인",
    situation: ({ targetName }) => `${targetName}은 내 카톡에는 답장이 느린데 방금 스토리를 올렸다.`,
    messages: ({ targetName }) => [
      { who: "system", text: `${targetName}님이 스토리를 업데이트했습니다.` },
      { who: "group", text: "친구들과 웃고 있는 사진이 올라왔다." },
    ],
    choices: [
      { text: "아무 의미 없다고 생각하려 한다", result: "억지로 넘기려 했지만 마음은 이미 반응한 뒤였다.", effects: { over: 14, affection: 3, self: -2, dignity: 2 } },
      { text: "스토리를 몇 번이고 다시 본다", result: "사진 속 표정과 분위기까지 분석하기 시작했다.", effects: { over: 28, affection: 8, self: -8, dignity: -3 } },
      { text: "SNS를 끄고 다른 걸 한다", result: "계속 보고 싶은 마음은 있었지만, 내 감정을 잠시 거리두기로 했다.", effects: { over: -8, affection: 0, self: 8, dignity: 8 } },
    ],
  },
  {
    id: 4,
    time: "PM 10:26",
    title: "답장 텀 비교",
    situation: ({ targetName }) => `${targetName}과 나의 대화창을 다시 보다 보니, 유독 오늘 답장이 느렸던 것 같다는 생각이 든다.`,
    messages: () => [
      { who: "system", text: "지난 대화 기록을 확인하는 중..." },
      { who: "system", text: "평균 답장 시간: 14분 → 오늘 47분" },
    ],
    choices: [
      { text: "숫자에 의미를 부여하기 시작한다", result: "이유를 찾기 시작하자 마음이 더 복잡해졌다.", effects: { over: 20, affection: 5, self: -6, dignity: -1 } },
      { text: "그날 상황이 달랐을 수도 있다고 생각한다", result: "완벽히 납득되진 않지만 스스로를 조금 진정시켰다.", effects: { over: -5, affection: 0, self: 5, dignity: 4 } },
      { text: "핸드폰을 뒤집어 놓는다", result: "생각을 멈추고 싶어 물리적으로 거리를 두었다.", effects: { over: -10, affection: -2, self: 10, dignity: 9 } },
    ],
  },
  {
    id: 5,
    time: "PM 11:11",
    title: "늦은 밤의 상태",
    situation: "하루가 거의 끝나간다. 그런데도 머릿속 대화는 아직 끝나지 않았다.",
    messages: () => [{ who: "system", text: "최근 1시간 동안 대화창을 17번 확인했습니다." }],
    choices: [
      { text: "내 감정이 너무 커졌다는 걸 인정한다", result: "인정하는 순간 마음 한켠이 조금 조용해졌다.", effects: { over: -14, affection: 0, self: 12, dignity: 8 } },
      { text: "혹시 내일은 달라질 거라 기대한다", result: "불안과 기대가 같이 남은 채 밤이 깊어졌다.", effects: { over: 10, affection: 12, self: -2, dignity: 0 } },
      { text: "오늘은 그냥 나를 먼저 재우기로 한다", result: "답장을 기다리는 마음보다 지친 내 상태를 먼저 챙기기로 했다.", effects: { over: -18, affection: 0, self: 15, dignity: 12 } },
    ],
  },
  {
    id: 6,
    time: "PM 11:32",
    title: "읽고 안 보냄",
    situation: ({ targetName }) => `${targetName}의 마지막 메시지를 읽고 답장을 쓰다 지웠다를 반복하고 있다.`,
    messages: () => [
      { who: "me", text: "아니야 잘자 ㅋㅋ" },
      { who: "system", text: "메시지가 전송되지 않았습니다." },
    ],
    choices: [
      { text: "쿨한 척 짧게 보낸다", result: "괜찮은 척했지만 사실은 반응 하나하나를 의식하고 있었다.", effects: { over: 12, affection: 3, self: -1, dignity: 5 } },
      { text: "답장을 아예 보내지 않는다", result: "내가 먼저 멈추자 잠깐은 우위에 선 느낌이 들었다.", effects: { over: 8, affection: -4, self: 2, dignity: 10 } },
      { text: "솔직하게 더 대화하고 싶다고 말한다", result: "조금 민망했지만 적어도 숨기지는 않았다.", effects: { over: 16, affection: 12, self: 0, dignity: -2 } },
    ],
  },
  {
    id: 7,
    time: "PM 11:58",
    title: "친구에게 캡처 보내기",
    situation: "혼자 생각하기 힘들어 결국 친구에게 카톡 캡처를 보내기로 했다.",
    messages: () => [
      { who: "me", text: "야 얘 왜 이러는 것 같아?" },
      { who: "system", text: "사진 3장이 전송되었습니다." },
    ],
    choices: [
      { text: "친구 의견에 크게 흔들린다", result: "남의 해석이 내 감정을 더 흔들어놓기 시작했다.", effects: { over: 20, affection: 4, self: -6, dignity: -1 } },
      { text: "결국 답은 내가 정해야 한다고 느낀다", result: "상담은 했지만 감정의 결정권은 다시 나에게 돌아왔다.", effects: { over: -4, affection: 0, self: 8, dignity: 6 } },
      { text: "친구와 같이 상대를 분석하기 시작한다", result: "MBTI부터 말투 변화까지 분석이 끝없이 이어졌다.", effects: { over: 24, affection: 7, self: -4, dignity: 0 } },
    ],
  },
  {
    id: 8,
    time: "AM 12:26",
    title: "새벽 스토리 조회",
    situation: ({ targetName }) => `잠들기 직전, ${targetName}이 내 스토리를 조회한 걸 발견했다.`,
    messages: ({ targetName }) => [
      { who: "system", text: "스토리를 확인한 사람 1명 추가" },
      { who: "system", text: `${targetName}님이 회원님의 스토리를 봤습니다.` },
    ],
    choices: [
      { text: "괜히 의미를 부여하게 된다", result: "스토리 하나에도 마음이 크게 흔들리기 시작했다.", effects: { over: 20, affection: 8, self: -4, dignity: -1 } },
      { text: "그냥 습관처럼 본 걸 수도 있다고 생각한다", result: "애써 담담하려 했지만 신경이 완전히 꺼지지는 않았다.", effects: { over: -4, affection: 0, self: 4, dignity: 4 } },
      { text: "스토리를 다시 확인하며 반응을 상상한다", result: "내가 올린 문장과 사진의 의미를 스스로 다시 분석하기 시작했다.", effects: { over: 24, affection: 10, self: -5, dignity: -2 } },
    ],
  },
  {
    id: 9,
    time: "AM 12:51",
    title: "프로필 사진 의미부여",
    situation: ({ targetName }) => `${targetName}의 프로필 사진이 바뀐 걸 발견했다.`,
    messages: () => [{ who: "system", text: "프로필 사진이 변경되었습니다." }],
    choices: [
      { text: "혹시 누군가 생긴 건 아닌지 상상한다", result: "상상은 점점 구체적인 장면으로 커져갔다.", effects: { over: 28, affection: 5, self: -10, dignity: -3 } },
      { text: "그냥 사진 하나일 뿐이라고 넘긴다", result: "완전히 신경 안 쓰이진 않았지만 억지로라도 선을 그었다.", effects: { over: -8, affection: -2, self: 6, dignity: 6 } },
      { text: "나도 프사를 바꾸고 싶어진다", result: "괜히 나도 뭔가 달라 보이고 싶다는 마음이 들었다.", effects: { over: 10, affection: 7, self: 1, dignity: 3 } },
    ],
  },
  {
    id: 10,
    time: "AM 1:18",
    title: "추천 게시물 의미부여",
    situation: ({ targetName }) => `${targetName}이 좋아할 것 같은 게시물이 자꾸 눈에 들어오기 시작했다.`,
    messages: () => [
      { who: "system", text: "추천 게시물을 확인하는 중..." },
      { who: "group", text: "연애 심리 관련 릴스를 5개 연속 시청했습니다." },
    ],
    choices: [
      { text: "상대 마음을 분석하려고 계속 찾아본다", result: "답을 찾고 싶었지만 오히려 더 많은 해석만 쌓여갔다.", effects: { over: 22, affection: 6, self: -6, dignity: -2 } },
      { text: "그만 보고 잠들려고 한다", result: "쉽지는 않았지만 생각의 흐름을 끊어보려 했다.", effects: { over: -10, affection: -2, self: 10, dignity: 8 } },
      { text: "나도 은근한 의미의 게시물을 올리고 싶어진다", result: "직접 말은 못하지만 티는 내고 싶은 마음이 올라왔다.", effects: { over: 12, affection: 9, self: 0, dignity: 2 } },
    ],
  },
  {
    id: 11,
    time: "AM 1:44",
    title: "의미심장한 좋아요",
    situation: ({ targetName }) => `${targetName}이 몇 시간 전 내 게시물에 갑자기 좋아요를 눌렀다.`,
    messages: () => [{ who: "system", text: "회원님의 게시물을 좋아합니다." }],
    choices: [
      { text: "괜히 타이밍에 의미를 부여한다", result: "좋아요 하나가 다시 희망처럼 느껴졌다.", effects: { over: 14, affection: 10, self: -2, dignity: 0 } },
      { text: "그냥 지나가다 누른 거라 생각한다", result: "마음을 붙잡으려 애쓰며 의미를 줄이려 했다.", effects: { over: -6, affection: -2, self: 5, dignity: 5 } },
      { text: "나도 상대 게시물을 보러 간다", result: "다시 SNS 순찰이 시작됐다.", effects: { over: 18, affection: 5, self: -4, dignity: -1 } },
    ],
  },
  {
    id: 12,
    time: "AM 2:03",
    title: "DM 입력중 착각",
    situation: ({ targetName }) => `${targetName}이 입력 중인 것 같다가 갑자기 사라졌다.`,
    messages: () => [
      { who: "system", text: "입력 중..." },
      { who: "system", text: "상태가 종료되었습니다." },
    ],
    choices: [
      { text: "무슨 말을 쓰다 지웠는지 상상한다", result: "존재하지 않는 문장을 혼자 완성하기 시작했다.", effects: { over: 22, affection: 8, self: -6, dignity: -2 } },
      { text: "별 의미 없다고 넘긴다", result: "아쉽긴 했지만 생각의 속도를 줄였다.", effects: { over: -8, affection: 0, self: 6, dignity: 5 } },
      { text: "나도 괜히 채팅창을 열었다 닫는다", result: "보내지도 않을 말을 계속 쓰고 있었다.", effects: { over: 14, affection: 4, self: -2, dignity: 0 } },
    ],
  },
  {
    id: 13,
    time: "AM 2:28",
    title: "노래 가사 의미부여",
    situation: ({ targetName }) => `${targetName}의 스토리 배경 음악 가사가 괜히 신경 쓰인다.`,
    messages: () => [{ who: "group", text: "'보고 싶다'라는 가사가 반복된다." }],
    choices: [
      { text: "혹시 나를 생각한 건지 상상한다", result: "감정은 점점 이야기처럼 커져갔다.", effects: { over: 20, affection: 12, self: -5, dignity: -1 } },
      { text: "그냥 유행 노래일 뿐이라고 생각한다", result: "억지로 현실적인 방향으로 마음을 붙잡았다.", effects: { over: -5, affection: -1, self: 4, dignity: 4 } },
      { text: "나도 의미심장한 노래를 찾는다", result: "티 내지 않는 방식으로 마음을 표현하고 싶어졌다.", effects: { over: 12, affection: 7, self: 0, dignity: 1 } },
    ],
  },
  {
    id: 14,
    time: "AM 2:56",
    title: "친구 상태 비교",
    situation: "친구들은 아무렇지 않게 자고 있는데 나만 계속 깨어있는 느낌이 든다.",
    messages: () => [{ who: "system", text: "최근 활동 중인 친구 0명" }],
    choices: [
      { text: "나만 유난인 것 같아 부끄러워진다", result: "감정이 커진 스스로를 자꾸 검열하게 된다.", effects: { over: 8, affection: 0, self: -6, dignity: -1 } },
      { text: "누구나 이런 밤이 있다고 생각한다", result: "조금은 인간적인 감정처럼 느껴졌다.", effects: { over: -4, affection: 0, self: 6, dignity: 5 } },
      { text: "계속 대화창만 새로고침한다", result: "기다림이 습관처럼 반복되고 있었다.", effects: { over: 18, affection: 4, self: -4, dignity: -2 } },
    ],
  },
  {
    id: 15,
    time: "AM 3:14",
    title: "혼자 보는 사진첩",
    situation: ({ targetName }) => `${targetName}과 찍었던 사진들을 다시 보게 됐다.`,
    messages: () => [{ who: "system", text: "사진 24장을 다시 확인했습니다." }],
    choices: [
      { text: "좋았던 순간만 계속 떠올린다", result: "기억은 현재보다 더 따뜻하게 보정되었다.", effects: { over: 14, affection: 14, self: -3, dignity: -1 } },
      { text: "사진을 닫고 현실로 돌아온다", result: "추억과 현재를 일부러 분리하려 했다.", effects: { over: -10, affection: -3, self: 10, dignity: 7 } },
      { text: "사진 속 표정을 분석하기 시작한다", result: "그때의 감정까지 해석하려 들고 있었다.", effects: { over: 22, affection: 6, self: -5, dignity: -2 } },
    ],
  },
  {
    id: 16,
    time: "AM 3:33",
    title: "괜한 접속 확인",
    situation: ({ targetName }) => `${targetName}의 프로필을 또 눌러봤다.`,
    messages: () => [{ who: "system", text: "최근 20분 동안 동일 프로필 6회 방문" }],
    choices: [
      { text: "내가 지금 집착하는 건 아닌지 생각한다", result: "스스로도 감정의 크기를 체감하기 시작했다.", effects: { over: -2, affection: 0, self: 4, dignity: 1 } },
      { text: "계속 확인한다", result: "확인할수록 마음은 더 고정되었다.", effects: { over: 20, affection: 5, self: -6, dignity: -3 } },
      { text: "핸드폰을 침대 밖에 둔다", result: "물리적인 거리 덕분에 생각도 조금 멀어졌다.", effects: { over: -12, affection: -2, self: 10, dignity: 8 } },
    ],
  },
  {
    id: 17,
    time: "AM 3:52",
    title: "상대 마지막 말 복기",
    situation: ({ targetName }) => `${targetName}의 마지막 말투가 계속 머릿속에서 반복된다.`,
    messages: () => [{ who: "target", text: "ㅋㅋ 알겠어" }],
    choices: [
      { text: "말투의 온도를 분석한다", result: "단어보다 숨은 감정을 찾고 싶어졌다.", effects: { over: 18, affection: 5, self: -4, dignity: -1 } },
      { text: "텍스트는 텍스트일 뿐이라 생각한다", result: "완전히는 아니어도 마음이 조금 현실로 돌아왔다.", effects: { over: -8, affection: 0, self: 7, dignity: 6 } },
      { text: "읽지 않은 척 대화창을 닫는다", result: "애매한 감정을 잠시 미뤄두기로 했다.", effects: { over: -3, affection: -1, self: 4, dignity: 5 } },
    ],
  },
  {
    id: 18,
    time: "AM 4:11",
    title: "새벽 감성 글쓰기",
    situation: "괜히 혼잣말 같은 글을 메모장에 적기 시작했다.",
    messages: () => [{ who: "me", text: "왜 이렇게 작은 반응에 흔들릴까" }],
    choices: [
      { text: "감정을 솔직하게 적는다", result: "적어 내려가자 마음이 조금 정리되기 시작했다.", effects: { over: -10, affection: 0, self: 12, dignity: 5 } },
      { text: "결국 다시 상대 이야기만 한다", result: "글조차 상대 중심으로 흘러가고 있었다.", effects: { over: 14, affection: 7, self: -4, dignity: -1 } },
      { text: "메모를 지워버린다", result: "감정을 들킨 것 같아 괜히 민망해졌다.", effects: { over: 4, affection: 0, self: -2, dignity: 2 } },
    ],
  },
  {
    id: 19,
    time: "AM 4:39",
    title: "괜찮은 척 연습",
    situation: "내일 아무렇지 않은 척하려는 시뮬레이션을 혼자 하고 있다.",
    messages: () => [{ who: "system", text: "내일의 대화 장면을 상상 중..." }],
    choices: [
      { text: "완벽하게 쿨한 모습을 상상한다", result: "감정을 숨기는 방향으로 자꾸 연습하게 된다.", effects: { over: 8, affection: -2, self: -2, dignity: 8 } },
      { text: "있는 그대로 반응하기로 한다", result: "조금 불안하지만 덜 연기하는 방향을 선택했다.", effects: { over: -6, affection: 2, self: 8, dignity: 2 } },
      { text: "내일의 나는 내일 생각하기로 한다", result: "지금은 쉬는 게 먼저라는 생각이 들었다.", effects: { over: -12, affection: 0, self: 10, dignity: 7 } },
    ],
  },
  {
    id: 20,
    time: "AM 5:02",
    title: "해 뜨기 직전",
    situation: "밤이 거의 끝나간다. 감정도 조금씩 현실로 돌아오기 시작한다.",
    messages: () => [{ who: "system", text: "창밖이 조금 밝아지고 있습니다." }],
    choices: [
      { text: "밤의 감정은 밤에 커진다는 걸 인정한다", result: "조금은 객관적으로 나를 바라보게 됐다.", effects: { over: -15, affection: -2, self: 12, dignity: 8 } },
      { text: "아직도 상대 생각뿐이다", result: "밤은 끝났지만 감정은 아직 끝나지 않았다.", effects: { over: 16, affection: 10, self: -5, dignity: -2 } },
      { text: "오늘 하루는 나를 먼저 챙기기로 한다", result: "관계보다 내 컨디션을 먼저 보기 시작했다.", effects: { over: -18, affection: 0, self: 15, dignity: 10 } },
    ],
  },
  {
    id: 21,
    time: "AM 5:28",
    title: "마지막 선택",
    situation: "오늘의 대화는 애매하게 끝났다. 이 애매함을 어떻게 처리할까?",
    messages: () => [{ who: "system", text: "대화 종료" }],
    choices: [
      { text: "오늘 반응을 근거로 마음을 접겠다고 결론낸다", result: "결론은 빠르지만 마음은 아직 따라오지 않는다. 그래도 통제감을 잠깐 얻었다.", effects: { over: 18, affection: -15, self: -4, dignity: 10 } },
      { text: "내일 다시 보면 달라질 수도 있다고 열어둔다", result: "가능성을 남겨두니 마음은 편하지만, 애매함도 같이 남았다.", effects: { over: 8, affection: 8, self: 2, dignity: 0 } },
      { text: "그의 태도보다 내 상태를 먼저 본다", result: "답을 그 사람에게서만 찾지 않기로 했다. 오늘의 나는 꽤 오래 버텼다.", effects: { over: -18, affection: 0, self: 15, dignity: 15 } },
    ],
  },
  {
    id: 22,
    time: "AM 5:44",
    title: "삭제할까 말까",
    situation: ({ targetName }) => `${targetName}과의 대화창을 위로 올렸다 내렸다 반복하고 있다.`,
    messages: () => [{ who: "system", text: "채팅방 나가기 버튼이 보입니다." }],
    choices: [
      { text: "대화방을 삭제하고 싶어진다", result: "감정을 끊고 싶다는 마음과 아직 남아있는 미련이 동시에 올라왔다.", effects: { over: 10, affection: -8, self: 2, dignity: 8 } },
      { text: "삭제는 못 하고 그냥 닫아둔다", result: "정리되지 않은 감정처럼 대화방도 그대로 남겨두었다.", effects: { over: 6, affection: 5, self: -2, dignity: 1 } },
      { text: "채팅방 이름을 보고 혼자 웃는다", result: "아직은 완전히 미워할 수도 놓을 수도 없는 상태였다.", effects: { over: -4, affection: 8, self: 4, dignity: 0 } },
    ],
  },
  {
    id: 23,
    time: "AM 6:02",
    title: "아침 공기",
    situation: "밤새 붙잡고 있던 감정이 아침 공기 속에서 조금씩 옅어진다.",
    messages: () => [{ who: "system", text: "새로운 하루가 시작됩니다." }],
    choices: [
      { text: "오늘은 휴대폰을 덜 보기로 한다", result: "관계보다 내 리듬을 먼저 회복하고 싶어졌다.", effects: { over: -14, affection: -2, self: 12, dignity: 8 } },
      { text: "일어나자마자 다시 확인한다", result: "잠깐 잊고 있던 감정이 다시 현실처럼 밀려왔다.", effects: { over: 16, affection: 6, self: -5, dignity: -2 } },
      { text: "아무 일 없었던 것처럼 하루를 시작한다", result: "감정은 남아있지만 적어도 삶 전체를 흔들게 두지는 않았다.", effects: { over: -6, affection: 0, self: 8, dignity: 6 } },
    ],
  },
  {
    id: 24,
    time: "AM 6:21",
    title: "진짜 마지막 확인",
    situation: ({ targetName }) => `${targetName}의 채팅창을 마지막으로 한 번 더 열어봤다.`,
    messages: () => [{ who: "system", text: "새로운 메시지는 없습니다." }],
    choices: [
      { text: "허무함을 느낀다", result: "기다림 끝에 남은 건 생각보다 조용한 감정이었다.", effects: { over: -10, affection: -4, self: 6, dignity: 4 } },
      { text: "그래도 또 기다리게 될 것 같다", result: "이성은 끝났다고 말하지만 마음은 아직 남아있었다.", effects: { over: 14, affection: 8, self: -4, dignity: -1 } },
      { text: "핸드폰을 끄고 눈을 감는다", result: "오늘의 감정을 여기까지 하기로 했다.", effects: { over: -18, affection: 0, self: 14, dignity: 10 } },
    ],
  },
];

const clamp = (value) => Math.max(0, Math.min(100, value));
const renderText = (value, player) => (typeof value === "function" ? value(player) : value);

const getRelationshipBonus = (relationship) => {
  if (relationship === "썸") return { over: 2, affection: 2, self: -1, dignity: 0 };
  if (relationship === "연인") return { over: 1, affection: 1, self: -2, dignity: -1 };
  return { over: -2, affection: -2, self: 2, dignity: 1 };
};

const getSensitivityBonus = (sensitivity) => {
  if (sensitivity === "높음") return { over: 2, affection: 1, self: -1, dignity: 0 };
  if (sensitivity === "낮음") return { over: -2, affection: -1, self: 1, dignity: 1 };
  return { over: 0, affection: 0, self: 0, dignity: 0 };
};

const calculateMentalScore = (stats) => {
  const stability = stats.self * 0.4;
  const dignity = stats.dignity * 0.3;
  const affectionRisk = (100 - stats.affection) * 0.1;
  const overthinkingPenalty = (100 - stats.over) * 0.2;
  return clamp(Math.round(stability + dignity + affectionRisk + overthinkingPenalty));
};

function getEnding(stats, player) {
  const { targetName } = player;

  if (stats.over >= 75 && stats.self < 45) {
    return { title: "과해석 루프형", emoji: "🌀", visualLabel: "생각의 소용돌이", visualBg: "#7f1d1d", visualShadow: "0 10px 24px rgba(127,29,29,0.28)", text: `${targetName}의 말보다 빈칸이 더 크게 느껴졌다. 답장이 아니라 불안을 기다린 하루였다.` };
  }

  if (stats.dignity >= 70 && stats.affection <= 45) {
    return { title: "자존심 방어형", emoji: "🧊", visualLabel: "차갑게 닫은 마음", visualBg: "#1e293b", visualShadow: "0 10px 24px rgba(30,41,59,0.28)", text: `겉으로는 쿨했다. 다만 마음 한쪽에는 '그래도 ${targetName}이 먼저 와줬으면' 하는 작은 문장이 남았다.` };
  }

  if (stats.self >= 70) {
    return { title: "자기 회복형", emoji: "🌱", visualLabel: "다시 나에게", visualBg: "#14532d", visualShadow: "0 10px 24px rgba(20,83,45,0.28)", text: `${targetName}의 반응을 해석하느라 나를 잃지 않았다. 오늘은 답장보다 내 상태를 먼저 챙겼다.` };
  }

  if (stats.affection >= 70) {
    return { title: "가능성 유지형", emoji: "🌙", visualLabel: "아직 열린 밤", visualBg: "#312e81", visualShadow: "0 10px 24px rgba(49,46,129,0.28)", text: `아직 ${targetName}과의 가능성을 끝내기엔 근거가 부족하다. 하지만 다음엔 말보다 행동을 더 보기로 했다.` };
  }

  return { title: "애매함 유지형", emoji: "☁️", visualLabel: "흐린 마음", visualBg: "#44403c", visualShadow: "0 10px 24px rgba(68,64,60,0.28)", text: `좋지도 나쁘지도 않은 하루. ${targetName} 때문에 마음은 조금 흔들렸지만, 완전히 무너지지는 않았다.` };
}

function Gauge({ label, value }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6, color: "#52525b" }}>
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: "#e4e4e7", overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: "#27272a", transition: "width 0.25s ease" }} />
      </div>
    </div>
  );
}

function MessageBubble({ message, player }) {
  const isMe = message.who === "me";
  const isSystem = message.who === "system";
  const isGroup = message.who === "group";
  const speaker = message.who === "me" ? player.myName : message.who === "target" ? player.targetName : "";

  let background = "#e4e4e7";
  let color = "#18181b";
  let border = "none";

  if (isMe) background = "#ffffff";
  if (isSystem) {
    background = "#3f3f46";
    color = "#f4f4f5";
  }
  if (isGroup) {
    background = "#27272a";
    color = "#ffffff";
    border = "1px solid #52525b";
  }

  return (
    <div style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", marginBottom: 8 }}>
      <div style={{ maxWidth: "78%", borderRadius: 18, padding: "9px 14px", fontSize: 14, lineHeight: 1.45, background, color, border }}>
        {speaker && <div style={{ fontSize: 11, opacity: 0.65, marginBottom: 3 }}>{speaker}</div>}
        {message.text}
      </div>
    </div>
  );
}

function ChoiceGroup({ title, options, value, onChange }) {
  const isMobile = useIsMobile();

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>{title}</div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : `repeat(${options.length}, 1fr)`, gap: 8 }}>
        {options.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            style={{
              border: value === item.value ? "2px solid #18181b" : "1px solid #d4d4d8",
              background: value === item.value ? "#18181b" : "#ffffff",
              color: value === item.value ? "#ffffff" : "#18181b",
              borderRadius: 14,
              padding: "11px 8px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function StartScreen({ setup, setSetup, onStart }) {
  const [errorMessage, setErrorMessage] = useState("");
  const isMobile = useIsMobile();

  const handleStart = () => {
    if (!setup.myName.trim() || !setup.targetName.trim()) {
      setErrorMessage("내 이름과 상대방 이름을 입력하세요.");
      return;
    }

    setErrorMessage("");
    onStart();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f4f5", padding: isMobile ? 10 : 16, boxSizing: "border-box", display: "flex", alignItems: isMobile ? "flex-start" : "center", justifyContent: "center" }}>
      <section style={{ width: "100%", maxWidth: 520, background: "#ffffff", borderRadius: isMobile ? 18 : 24, padding: isMobile ? 18 : 26, boxShadow: "0 1px 14px rgba(0,0,0,0.08)" }}>
        <h1 style={{ margin: 0, fontSize: isMobile ? 26 : 31, lineHeight: 1.15 }}>읽씹 시뮬레이터</h1>
        <p style={{ margin: "10px 0 24px", color: "#71717a", lineHeight: 1.6 }}>답장 하나에 의미 부여해본 적 있다면 이미 플레이 자격 충분해.</p>

        <ChoiceGroup
          title="성별"
          value={setup.gender}
          onChange={(value) => setSetup((current) => ({ ...current, gender: value }))}
          options={[{ value: "female", label: "여성" }, { value: "male", label: "남성" }, { value: "none", label: "선택 안 함" }]}
        />

        <label style={{ display: "block", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>내 이름</div>
          <input
            value={setup.myName}
            onChange={(event) => setSetup((current) => ({ ...current, myName: event.target.value }))}
            placeholder="입력하세요 예: 은주"
            style={{ width: "100%", boxSizing: "border-box", border: "1px solid #d4d4d8", borderRadius: 14, padding: "13px 14px", fontSize: 15 }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>상대방 이름</div>
          <input
            value={setup.targetName}
            onChange={(event) => setSetup((current) => ({ ...current, targetName: event.target.value }))}
            placeholder="입력하세요 예: 현승"
            style={{ width: "100%", boxSizing: "border-box", border: "1px solid #d4d4d8", borderRadius: 14, padding: "13px 14px", fontSize: 15 }}
          />
        </label>

        <ChoiceGroup
          title="현재 관계"
          value={setup.relationship}
          onChange={(value) => setSetup((current) => ({ ...current, relationship: value }))}
          options={[{ value: "썸", label: "썸" }, { value: "연인", label: "연인" }, { value: "친구", label: "친구" }]}
        />

        <ChoiceGroup
          title="내 연락 스타일"
          value={setup.contactStyle}
          onChange={(value) => setSetup((current) => ({ ...current, contactStyle: value }))}
          options={[{ value: "불안형", label: "불안형" }, { value: "회피형", label: "회피형" }, { value: "안정형", label: "안정형" }]}
        />

        <ChoiceGroup
          title="감정 민감도"
          value={setup.sensitivity}
          onChange={(value) => setSetup((current) => ({ ...current, sensitivity: value }))}
          options={[{ value: "낮음", label: "낮음" }, { value: "보통", label: "보통" }, { value: "높음", label: "높음" }]}
        />

        <button
          type="button"
          onClick={handleStart}
          style={{ width: "100%", border: "none", background: "#18181b", color: "#ffffff", borderRadius: 16, padding: "14px 16px", fontSize: 16, fontWeight: 800, cursor: "pointer" }}
        >
          게임 시작하기
        </button>

        {errorMessage && <div style={{ marginTop: 12, color: "#b91c1c", fontSize: 14, fontWeight: 700, textAlign: "center" }}>{errorMessage}</div>}
      </section>
    </div>
  );
}

export default function ReadReceiptSimulator() {
  const isMobile = useIsMobile();
  const [hasStarted, setHasStarted] = useState(false);
  const [setup, setSetup] = useState(DEFAULT_PLAYER);
  const [player, setPlayer] = useState(DEFAULT_PLAYER);
  const [step, setStep] = useState(0);
  const [stats, setStats] = useState(INITIAL_STATS);
  const [lastResult, setLastResult] = useState(INITIAL_MESSAGE);

  const isEnd = step >= scenes.length;
  const scene = isEnd ? null : scenes[step];
  const ending = useMemo(() => getEnding(stats, player), [stats, player]);
  const sceneMessages = scene ? scene.messages(player) : [];
  const mentalScore = calculateMentalScore(stats);

  const startGame = () => {
    setPlayer({
      gender: setup.gender,
      myName: setup.myName.trim() || "은주",
      targetName: setup.targetName.trim() || "현승",
      relationship: setup.relationship,
      contactStyle: setup.contactStyle,
      sensitivity: setup.sensitivity,
    });
    setHasStarted(true);
    setStep(0);
    setStats(INITIAL_STATS);
    setLastResult(INITIAL_MESSAGE);
  };

  const choose = (choice) => {
    if (!scene || !choice) return;

    const styleBonus = {
      over: player.contactStyle === "불안형" ? 3 : player.contactStyle === "안정형" ? -1 : 2,
      dignity: player.contactStyle === "회피형" ? 3 : player.contactStyle === "안정형" ? 2 : 0,
      self: player.contactStyle === "안정형" ? 2 : player.contactStyle === "불안형" ? -2 : 0,
    };
    const relationshipBonus = getRelationshipBonus(player.relationship);
    const sensitivityBonus = getSensitivityBonus(player.sensitivity);

    setStats((currentStats) => ({
      over: clamp(currentStats.over + choice.effects.over + styleBonus.over + relationshipBonus.over + sensitivityBonus.over),
      affection: clamp(currentStats.affection + choice.effects.affection + relationshipBonus.affection + sensitivityBonus.affection),
      self: clamp(currentStats.self + choice.effects.self + styleBonus.self + relationshipBonus.self + sensitivityBonus.self),
      dignity: clamp(currentStats.dignity + choice.effects.dignity + styleBonus.dignity + relationshipBonus.dignity + sensitivityBonus.dignity),
    }));

    const relationshipResult =
      player.relationship === "썸"
        ? "아직 확실한 사이가 아니라서 작은 신호 하나도 가능성과 불안으로 크게 번진다."
        : player.relationship === "연인"
        ? "이미 가까운 사이라는 기대가 있어서, 무심한 반응은 더 직접적인 서운함으로 느껴진다."
        : "친구라는 관계 안에서는 선을 넘지 않으려는 마음 때문에 해석을 조심하게 된다.";

    const sensitivityText =
      player.sensitivity === "높음"
        ? "상대의 말투와 반응 속도 하나에도 감정이 크게 흔들린다."
        : player.sensitivity === "보통"
        ? "괜찮은 척하려 하지만 은근히 계속 신경이 쓰인다."
        : "생각보다 담담하려고 노력하고 있지만 마음 한켠은 여전히 반응하고 있다.";

    setLastResult(`${choice.result} ${player.contactStyle} 성향인 나는 이 상황을 쉽게 넘기지 못하고 있다. ${relationshipResult} ${sensitivityText}`);
    setStep((currentStep) => Math.min(currentStep + 1, scenes.length));
  };

  const reset = () => {
    setHasStarted(false);
    setStep(0);
    setStats(INITIAL_STATS);
    setLastResult(INITIAL_MESSAGE);
  };

  if (!hasStarted) return <StartScreen setup={setup} setSetup={setSetup} onStart={startGame} />;

  return (
    <div style={{ minHeight: "100vh", background: "#f4f4f5", padding: isMobile ? 10 : 16, boxSizing: "border-box" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1.15fr) minmax(280px, 0.85fr)", gap: isMobile ? 12 : 16 }}>
        <main style={{ background: "#ffffff", borderRadius: isMobile ? 18 : 22, padding: isMobile ? 16 : 24, boxShadow: "0 1px 10px rgba(0,0,0,0.06)", minWidth: 0 }}>
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "stretch" : "flex-start", gap: isMobile ? 10 : 16, marginBottom: isMobile ? 16 : 22 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: isMobile ? 25 : 30, lineHeight: 1.15 }}>읽씹 시뮬레이터</h1>
              <p style={{ margin: "8px 0 0", color: "#71717a", fontSize: isMobile ? 13 : 14, lineHeight: 1.5 }}>읽씹 3분째부터 혼자 연애 시뮬레이션 시작하는 사람들의 심리 게임</p>
            </div>
            <button type="button" onClick={reset} style={{ border: "1px solid #d4d4d8", background: "#ffffff", borderRadius: 14, padding: "9px 13px", cursor: "pointer", whiteSpace: "nowrap", width: isMobile ? "100%" : "auto" }}>처음으로</button>
          </div>

          {!isEnd && scene ? (
            <section>
              <div style={{ border: "1px solid #e4e4e7", borderRadius: 20, padding: 16, marginBottom: 16 }}>
                <div style={{ color: "#a1a1aa", fontSize: 12, marginBottom: 5 }}>{scene.time}</div>
                <h2 style={{ margin: 0, fontSize: isMobile ? 20 : 22 }}>{scene.title}</h2>
                <p style={{ color: "#3f3f46", lineHeight: 1.7, marginBottom: 0 }}>{renderText(scene.situation, player)}</p>
              </div>

              <div style={{ background: "#44403c", borderRadius: 20, padding: isMobile ? 12 : 16, minHeight: isMobile ? 120 : 145, marginBottom: 16 }}>
                {sceneMessages.map((message, index) => <MessageBubble key={`${scene.id}-${message.who}-${index}`} message={message} player={player} />)}
              </div>

              <div style={{ display: "grid", gap: 9 }}>
                {scene.choices.map((choice) => (
                  <button key={choice.text} type="button" onClick={() => choose(choice)} style={{ width: "100%", border: "none", borderRadius: 18, background: "#e4e4e7", padding: isMobile ? "14px 14px" : "13px 15px", textAlign: "left", cursor: "pointer", fontSize: isMobile ? 14 : 15, lineHeight: 1.45 }}>{choice.text}</button>
                ))}
              </div>
            </section>
          ) : (
            <section>
              <div style={{ border: "1px solid #e4e4e7", borderRadius: 20, padding: 24, textAlign: "center", marginBottom: 16 }}>
                <div
                  style={{
                    width: 86,
                    height: 86,
                    margin: "0 auto 14px",
                    borderRadius: "50%",
                    background: ending.visualBg,
                    color: "#ffffff",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: ending.visualShadow,
                  }}
                >
                  <div style={{ fontSize: 32, lineHeight: 1 }}>{ending.emoji}</div>
                  <div style={{ fontSize: 9, opacity: 0.8, marginTop: 5, fontWeight: 700 }}>{ending.visualLabel}</div>
                </div>
                <h2 style={{ margin: 0, fontSize: 26 }}>{ending.title}</h2>
                <p style={{ color: "#3f3f46", lineHeight: 1.7 }}>{ending.text}</p>
              </div>

              <div style={{ border: "1px solid #e4e4e7", borderRadius: 20, padding: 24, background: "#fafafa" }}>
                <h3 style={{ marginTop: 0, marginBottom: 14, fontSize: 22 }}>오늘의 감정 분석</h3>
                <p style={{ color: "#3f3f46", lineHeight: 1.9, marginTop: 0 }}>오늘의 {player.myName}은(는) 단순히 답장을 기다린 것이 아니라, 상대의 반응 속에서 자신의 의미를 계속 확인하려 하고 있었다. 특히 {player.contactStyle} 성향은 작은 반응에도 더 많은 해석을 만들게 했고, {player.relationship} 관계라는 조건은 같은 행동도 다르게 느끼게 만들었다. 감정 민감도 {player.sensitivity} 상태의 오늘은 말투 하나와 답장 시간 하나까지 크게 체감되는 밤이었다.</p>
                <p style={{ color: "#3f3f46", lineHeight: 1.9 }}>과해석 수치는 {stats.over}까지 올라갔고, 자기 안정감은 {stats.self} 상태로 유지되었다. 이는 현재 감정이 상대의 행동에 영향을 받고 있다는 의미이기도 하다. 하지만 동시에 {player.myName}은(는) 몇 번이고 스스로를 진정시키려 했고, 완전히 무너지기보다는 자기 감정을 인식하려는 방향으로 움직이고 있었다.</p>
                <p style={{ color: "#3f3f46", lineHeight: 1.9, marginBottom: 0 }}>오늘의 결과는 단순한 연애 결과가 아니라, 관계 속에서 {player.myName}이(가) 어떤 방식으로 불안과 기대를 다루는지를 보여준다. {ending.text}</p>
              </div>
            </section>
          )}
        </main>

        <aside style={{ display: "grid", gap: isMobile ? 12 : 16, alignContent: "start", minWidth: 0 }}>
          <section style={{ background: "#ffffff", borderRadius: 22, padding: 20, boxShadow: "0 1px 10px rgba(0,0,0,0.06)" }}>
            <h2 style={{ marginTop: 0, fontSize: 20 }}>플레이어 정보</h2>
            <p style={{ color: "#3f3f46", fontSize: 14, lineHeight: 1.7, marginTop: 0 }}>
              내 이름: {player.myName}<br />상대방: {player.targetName}<br />관계: {player.relationship}<br />연락 스타일: {player.contactStyle}<br />감정 민감도: {player.sensitivity}<br />성별: {player.gender === "female" ? "여성" : player.gender === "male" ? "남성" : "선택 안 함"}
            </p>
          </section>

          <section style={{ background: "#ffffff", borderRadius: 22, padding: 20, boxShadow: "0 1px 10px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <h2 style={{ marginTop: 0, marginBottom: 4, fontSize: 20 }}>마음 상태</h2>
                <div style={{ color: "#71717a", fontSize: 12 }}>심리 밸런스 분석</div>
              </div>
              <div style={{ minWidth: 82, borderRadius: 18, background: mentalScore >= 70 ? "#18181b" : mentalScore >= 45 ? "#52525b" : "#a1001a", color: "#ffffff", padding: "10px 12px", textAlign: "center", boxShadow: "0 6px 18px rgba(0,0,0,0.12)" }}>
                <div style={{ fontSize: 10, opacity: 0.7, marginBottom: 2 }}>최종 분석</div>
                <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1 }}>{mentalScore}</div>
              </div>
            </div>
            <Gauge label="과해석 게이지" value={stats.over} />
            <Gauge label="호감 기대치" value={stats.affection} />
            <Gauge label="자기 안정감" value={stats.self} />
            <Gauge label="자존심 방어" value={stats.dignity} />
          </section>

          <section style={{ background: "#ffffff", borderRadius: 22, padding: 20, boxShadow: "0 1px 10px rgba(0,0,0,0.06)" }}>
            <h2 style={{ marginTop: 0, fontSize: 20 }}>나는 오늘</h2>
            <p style={{ color: "#3f3f46", fontSize: 14, lineHeight: 1.65 }}>{lastResult}</p>
          </section>

          {isEnd && (
            <section style={{ background: ending.visualBg, color: "#ffffff", borderRadius: 22, padding: 20, boxShadow: ending.visualShadow }}>
              <h2 style={{ marginTop: 0, fontSize: 20 }}>{player.targetName}의 마음 분석</h2>
              <p style={{ color: "rgba(255,255,255,0.82)", fontSize: 14, lineHeight: 1.85 }}>
                {ending.title === "과해석 루프형"
                  ? `${player.targetName}은(는) 현재 ${player.myName}처럼 관계를 깊게 해석하고 있지는 않을 가능성이 높다. 연락의 온도 차이는 존재하지만, ${player.myName} 혼자 상대의 반응을 더 크게 받아들이고 있었을 수 있다. 특히 작은 텀과 말투 변화까지 의미를 연결하면서 감정 피로도가 커진 상태에 가깝다.`
                  : ending.title === "자존심 방어형"
                  ? `${player.targetName} 입장에서는 ${player.myName}의 반응이 생각보다 차갑고 거리감 있게 느껴졌을 가능성이 있다. 마음이 없는 건 아니지만, 서로 먼저 다가가기보다 눈치를 보는 흐름이 반복되며 관계의 온도가 서서히 멈춰가는 상태에 가까워졌다.`
                  : ending.title === "자기 회복형"
                  ? `${player.targetName}은(는) 오늘의 ${player.myName}에게서 안정적인 분위기를 느꼈을 가능성이 높다. 상대의 반응 하나에 크게 흔들리지 않고 자신의 감정을 조절하는 모습은 오히려 관계를 편안하게 유지시키는 방향으로 작용했을 수 있다.`
                  : ending.title === "가능성 유지형"
                  ? `${player.targetName} 역시 관계를 완전히 끊기보다는 애매하게 이어가고 싶은 마음이 남아있을 가능성이 있다. 표현은 조심스럽지만, 완전히 무관심한 상태는 아니며 현재는 서로의 반응을 탐색하는 흐름에 가까워 보인다.`
                  : `${player.targetName}도 어느 정도 편안함과 호감은 느끼고 있지만, 아직 감정의 방향이 확실하게 정리된 상태는 아니다. 지금 관계는 작은 신호 하나에도 분위기가 달라질 수 있는 흐린 단계에 머물러 있다.`}
              </p>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
