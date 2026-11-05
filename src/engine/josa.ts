// 이(가)·을(를)·과(와)·은(는)·(으)로·(이)라 를 앞 글자의 받침에 맞춰 고른다
const code = (ch: string): number => ch.charCodeAt(0) - 0xac00;
const isHangul = (ch: string): boolean => code(ch) >= 0 && code(ch) <= 11171;
const batchim = (ch: string): boolean => isHangul(ch) && code(ch) % 28 !== 0;
const rieul = (ch: string): boolean => isHangul(ch) && code(ch) % 28 === 8;

const PATTERN = /([가-힣])(이\(가\)|과\(와\)|을\(를\)|은\(는\)|\(으\)로|\(이\)라)/g;

export function fixJosa(text: string): string {
  if (!text) return text;
  return text.replace(PATTERN, (_, prev: string, j: string) => {
    const b = batchim(prev);
    switch (j) {
      case '이(가)': return prev + (b ? '이' : '가');
      case '과(와)': return prev + (b ? '과' : '와');
      case '을(를)': return prev + (b ? '을' : '를');
      case '은(는)': return prev + (b ? '은' : '는');
      case '(으)로': return prev + (b && !rieul(prev) ? '으로' : '로');
      case '(이)라': return prev + (b ? '이라' : '라');
      default: return prev + j;
    }
  });
}
