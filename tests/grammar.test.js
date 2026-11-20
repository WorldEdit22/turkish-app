import { test } from 'node:test';
import assert from 'node:assert/strict';
import { attach, capTr } from '../js/grammar.js';

const noun = (tr, o = {}) => ({ tr, type: 'noun', ...o });
const adj = (tr, o = {}) => ({ tr, type: 'adj', ...o });
const verb = (tr, o = {}) => ({ tr, type: 'verb', ...o });

function table(name, rows) {
  test(name, () => {
    for (const [word, suffix, want] of rows) {
      assert.equal(attach(word, suffix), want, `${word.tr} + ${suffix}`);
    }
  });
}

table('noun cases follow two-way vowel harmony and the y buffer', [
  [noun('ev'), '(y)A', 'eve'],
  [noun('okul'), '(y)A', 'okula'],
  [noun('araba'), '(y)A', 'arabaya'],
  [noun('ev'), 'DAn', 'evden'],
]);

table('four-way harmony picks ı i u ü', [
  [noun('su'), '(y)I', 'suyu'],
  [noun('ev'), '(I)m', 'evim'],
  [noun('göz'), '(I)m', 'gözüm'],
  [noun('okul'), '(I)m', 'okulum'],
  [noun('kız'), '(I)m', 'kızım'],
  [noun('araba'), '(I)m', 'arabam'],
  [noun('araba'), '(s)I', 'arabası'],
  [noun('ev'), '(s)I', 'evi'],
]);

table('D becomes t after a voiceless consonant', [
  [noun('ev'), 'DA', 'evde'],
  [noun('mutfak'), 'DA', 'mutfakta'],
  [noun('ofis'), 'DA', 'ofiste'],
  [noun('çocuk'), 'DA', 'çocukta'],
]);

table('polysyllabic nouns ending in k soften to ğ before a vowel', [
  [noun('ekmek'), '(y)I', 'ekmeği'],
  [noun('çocuk'), '(y)A', 'çocuğa'],
  [noun('mutfak'), '(I)m', 'mutfağım'],
  [noun('park'), '(y)A', 'parka'],
  [noun('merak', { noSoft: true }), '(y)I', 'merakı'],
]);

table('explicit soft stems are used only before a vowel', [
  [noun('kitap', { soft: 'kitab' }), '(I)m', 'kitabım'],
  [noun('kitap', { soft: 'kitab' }), 'DA', 'kitapta'],
  [noun('şehir', { soft: 'şehr' }), '(y)A', 'şehre'],
  [noun('şehir', { soft: 'şehr' }), 'DA', 'şehirde'],
  [noun('renk', { soft: 'reng' }), '(I)m', 'rengim'],
]);

table('harmony override handles loanwords like saat', [
  [noun('saat', { h: 'e' }), '(y)A', 'saate'],
  [noun('saat', { h: 'e' }), 'DA', 'saatte'],
  [noun('saat', { h: 'e' }), '(I)m', 'saatim'],
]);

table('su takes y before possessive endings', [
  [noun('su'), '(I)m', 'suyum'],
  [noun('su'), '(s)I', 'suyu'],
]);

table('compound nouns ending in a possessive take n before case endings', [
  [noun('otobüs durağı', { cmp: true }), '(y)A', 'otobüs durağına'],
  [noun('otobüs durağı', { cmp: true }), '(y)I', 'otobüs durağını'],
  [noun('otobüs durağı', { cmp: true }), 'DA', 'otobüs durağında'],
  [noun('otobüs durağı', { cmp: true }), 'DAn', 'otobüs durağından'],
  [noun('otobüs durağı', { cmp: true }), '(s)I', 'otobüs durağı'],
  [noun('otobüs durağı', { cmp: true }), '(s)I_nerede', 'otobüs durağı nerede'],
]);

table('underscore starts a separate word that keeps harmonising', [
  [adj('pahalı'), '_mI', 'pahalı mı'],
  [adj('iyi'), '_mI', 'iyi mi'],
  [adj('soğuk'), '_mI', 'soğuk mu'],
  [adj('büyük'), '_mI', 'büyük mü'],
  [noun('ev'), 'DA_mIsIn', 'evde misin'],
]);

table('personal endings on adjectives and locatives', [
  [adj('hasta'), '(y)Im', 'hastayım'],
  [adj('yorgun'), '(y)Im', 'yorgunum'],
  [adj('aç'), '(y)Im', 'açım'],
  [noun('ev'), 'DA(y)Im', 'evdeyim'],
  [noun('mutfak'), 'DA(y)Im', 'mutfaktayım'],
]);

table('with and without', [
  [noun('şeker'), 'sIz', 'şekersiz'],
  [noun('süt'), 'sIz', 'sütsüz'],
  [noun('süt'), 'lI', 'sütlü'],
  [noun('araba'), '(y)lA', 'arabayla'],
  [noun('otobüs'), '(y)lA', 'otobüsle'],
]);

table('verbs lose -mak/-mek and take the present continuous', [
  [verb('gelmek'), 'Iyorum', 'geliyorum'],
  [verb('yapmak'), 'Iyorum', 'yapıyorum'],
  [verb('görmek'), 'Iyorum', 'görüyorum'],
  [verb('okumak'), 'Iyorum', 'okuyorum'],
  [verb('beklemek'), 'Iyorum', 'bekliyorum'],
  [verb('anlamak'), 'Iyorum', 'anlıyorum'],
  [verb('söylemek'), 'Iyorum', 'söylüyorum'],
]);

table('negative present continuous', [
  [verb('gelmek'), 'mIyorum', 'gelmiyorum'],
  [verb('yapmak'), 'mIyorum', 'yapmıyorum'],
  [verb('okumak'), 'mIyorum', 'okumuyorum'],
  [verb('görmek'), 'mIyorum', 'görmüyorum'],
]);

table('git, et and tat soften to d before a vowel', [
  [verb('gitmek'), 'Iyorum', 'gidiyorum'],
  [verb('gitmek'), '(y)AcAğIm', 'gideceğim'],
  [verb('gitmek'), '(y)IncA', 'gidince'],
  [verb('gitmek'), '(y)Ip', 'gidip'],
  [verb('gitmek'), 'DIm', 'gittim'],
  [verb('yardım etmek'), '(y)Abilir_mIsIn', 'yardım edebilir misin'],
]);

table('ye and de become yi and di', [
  [verb('yemek'), 'Iyorum', 'yiyorum'],
  [verb('demek'), 'Iyorum', 'diyorum'],
  [verb('yemek'), '(y)AcAğIm', 'yiyeceğim'],
  [verb('yemek'), '(y)AlIm', 'yiyelim'],
  [verb('yemek'), '(y)Abilir_mIsIn', 'yiyebilir misin'],
  [verb('yemek'), 'RIm', 'yerim'],
  [verb('yemek'), '(y)In', 'yiyin'],
  [verb('yemek'), '(y)IncA', 'yiyince'],
  [verb('demek'), '(y)AlIm', 'diyelim'],
  [verb('demek'), '(y)AcAğIm', 'diyeceğim'],
]);

table('de- keeps its e before y + an i-type vowel', [
  [verb('demek'), '(y)In', 'deyin'],
  [verb('demek'), '(y)IncA', 'deyince'],
  [verb('demek'), '(y)Ip', 'deyip'],
]);

table('past tense', [
  [verb('gelmek'), 'DIm', 'geldim'],
  [verb('yapmak'), 'DIm', 'yaptım'],
  [verb('okumak'), 'DIm', 'okudum'],
  [verb('görmek'), 'DIm', 'gördüm'],
  [verb('içmek'), 'DIm', 'içtim'],
]);

table('future tense', [
  [verb('gelmek'), '(y)AcAğIm', 'geleceğim'],
  [verb('yapmak'), '(y)AcAğIm', 'yapacağım'],
  [verb('okumak'), '(y)AcAğIm', 'okuyacağım'],
  [verb('beklemek'), '(y)AcAğIm', 'bekleyeceğim'],
]);

table('aorist R: -Ar for one-syllable stems, -Ir for the 13 exceptions and longer stems, -r after a vowel', [
  [verb('yapmak'), 'RIm', 'yaparım'],
  [verb('içmek'), 'RIm', 'içerim'],
  [verb('gitmek'), 'RIm', 'giderim'],
  [verb('gelmek'), 'RIm', 'gelirim'],
  [verb('almak'), 'RIm', 'alırım'],
  [verb('bilmek'), 'RIm', 'bilirim'],
  [verb('görmek'), 'RIm', 'görürüm'],
  [verb('olmak'), 'RIm', 'olurum'],
  [verb('çalışmak'), 'RIm', 'çalışırım'],
  [verb('okumak'), 'RIm', 'okurum'],
  [verb('beklemek'), 'RIm', 'beklerim'],
  [verb('yardım etmek'), 'RIm', 'yardım ederim'],
  [verb('gelmek'), 'R_mIsIn', 'gelir misin'],
  [verb('yapmak'), 'R_mIsIn', 'yapar mısın'],
  [verb('okumak'), 'R_mIsIn', 'okur musun'],
  [verb('gelmek'), 'Rken', 'gelirken'],
  [verb('yapmak'), 'RsAn', 'yaparsan'],
]);

table('the other one-syllable -Ir exceptions', [
  [verb('bulmak'), 'RIm', 'bulurum'],
  [verb('sanmak'), 'RIm', 'sanırım'],
  [verb('kalmak'), 'RIm', 'kalırım'],
  [verb('vermek'), 'RIm', 'veririm'],
  [verb('durmak'), 'RIm', 'dururum'],
]);

table('other verb forms', [
  [verb('gelmek'), 'mAk', 'gelmek'],
  [verb('yapmak'), 'mAdAn', 'yapmadan'],
  [verb('gelmek'), 'DIktAn', 'geldikten'],
  [verb('yapmak'), 'DIktAn', 'yaptıktan'],
  [verb('gitmek'), 'DIktAn', 'gittikten'],
  [verb('okumak'), 'DIktAn', 'okuduktan'],
  [verb('okumak'), '(y)IncA', 'okuyunca'],
  [verb('görmek'), '(y)IncA', 'görünce'],
  [verb('beklemek'), '(y)In', 'bekleyin'],
  [verb('gelmek'), 'DIğImdA', 'geldiğimde'],
  [verb('yapmak'), 'DIğImdA', 'yaptığımda'],
  [verb('okumak'), 'DIğImdA', 'okuduğumda'],
  [verb('gelmek'), '(y)AmAm', 'gelemem'],
  [verb('okumak'), '(y)AmAm', 'okuyamam'],
  [verb('yapmak'), 'mAlIyIm', 'yapmalıyım'],
  [verb('yüzmek'), 'mAyI', 'yüzmeyi'],
  [verb('beklemek'), '(y)AnA', 'bekleyene'],
]);

test('capTr capitalises the Turkish way', () => {
  assert.equal(capTr('istanbul'), 'İstanbul');
  assert.equal(capTr('ılık'), 'Ilık');
  assert.equal(capTr('çay var mı?'), 'Çay var mı?');
  assert.equal(capTr(''), '');
});
