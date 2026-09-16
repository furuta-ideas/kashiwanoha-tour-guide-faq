const pptxgen = require("pptxgenjs");

/* ===== Design system extracted from 20260819_柏の葉スマートシティツアー(配布用_日本語版)_Rev22.pdf =====
   Fonts : BIZ UDPGothic (bold titles / regular body)
   Colors: teal 1D998E / 00A094, orange ED7D31, ink 44546A, pale E9F0F2, white
   Layout: 16:9, large centred title band, very little body text, generous whitespace
*/
const F = "BIZ UDPGothic";
const TEAL = "1D998E";
const TEAL_D = "12615A";
const TEAL_L = "00A094";
const ORANGE = "ED7D31";
const INK = "44546A";
const PALE = "E9F0F2";
const W = "FFFFFF";
const GREY = "7E929E";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 in
pres.author = "柏の葉スマートシティツアーズ";
pres.title = "便利すぎた街の失敗";

const M = 0.6;          // side margin
const CW = 13.333 - M * 2; // content width = 12.133

/* ---------- helpers ---------- */

function darkSlide() {
  const s = pres.addSlide();
  s.background = { color: TEAL_D };
  return s;
}

function lightSlide(no, title, eyebrow) {
  const s = pres.addSlide();
  s.background = { color: W };
  s.addText(eyebrow, {
    isTextBox: true, x: M, y: 0.32, w: CW, h: 0.42,
    fontFace: F, fontSize: 14, color: TEAL, bold: true, align: "center", margin: 0,
  });
  s.addText(title, {
    isTextBox: true, x: M, y: 0.72, w: CW, h: 0.9,
    fontFace: F, fontSize: 40, bold: true, color: INK, align: "center", margin: 0,
  });
  s.addText(String(no), {
    isTextBox: true, x: 13.333 - M - 0.7, y: 6.80, w: 0.7, h: 0.42,
    fontFace: F, fontSize: 14, color: GREY, align: "right", margin: 0,
  });
  return s;
}

// teal rounded-square number chip — the deck's repeating motif
function chip(s, label, x, y, size, fill) {
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w: size, h: size, fill: { color: fill || TEAL }, rectRadius: 0.08, line: { type: "none" },
  });
  s.addText(label, {
    isTextBox: true, x, y, w: size, h: size,
    fontFace: F, fontSize: 14, bold: true, color: W, align: "center", valign: "middle", margin: 0,
  });
}

function card(s, x, y, w, h, fill) {
  s.addShape(pres.ShapeType.rect, {
    x, y, w, h, fill: { color: fill || PALE }, line: { type: "none" },
  });
}

/* ================= 1. TITLE ================= */
{
  const s = darkSlide();
  s.addText("柏の葉スマートシティツアー", {
    isTextBox: true, x: M, y: 0.5, w: 7, h: 0.4,
    fontFace: F, fontSize: 14, color: TEAL_L, bold: true, margin: 0,
  });
  s.addText("2026.09.30 ／ Confidential", {
    isTextBox: true, x: 13.333 - M - 5, y: 0.5, w: 5, h: 0.4,
    fontFace: F, fontSize: 14, color: "7FA9A2", align: "right", margin: 0,
  });

  s.addText("便利すぎた街の失敗", {
    isTextBox: true, x: M, y: 2.35, w: CW, h: 1.5,
    fontFace: F, fontSize: 60, bold: true, color: W, align: "center", margin: 0,
  });
  s.addText("2020年　柏の葉ＭａａＳ実証実験　―　参加者の立場から", {
    isTextBox: true, x: M, y: 3.95, w: CW, h: 0.62,
    fontFace: F, fontSize: 20, color: "BFE0D8", align: "center", margin: 0,
  });

  s.addText("大阪大学大学院　工学研究科　ビジネスエンジニアリング専攻　様", {
    isTextBox: true, x: M, y: 6.30, w: CW, h: 0.52,
    fontFace: F, fontSize: 16, color: "8FC4BA", align: "center", margin: 0,
  });

  s.addNotes(
    "●ここからは、少し毛色の違うお話をさせてください。\n" +
    "●私自身が参加者だった、失敗したプロジェクトのお話です。\n" +
    "●２０２０年、この街でマンション住民向けのＭａａＳ実証実験が行われました。日本で初めての「マンション住民向けの、複数交通機関のサブスクリプション」です。\n" +
    "●私はそのとき、すぐ近くのマンションに住んでいて、応募して、当選して、実際に使っていた参加者でした。\n" +
    "●ですので今日は、事業者の立場ではなく、使っていた住民の立場からお話しします。\n" +
    "●皆さんが検討されている「分散型モビリティ拠点ネットワーク」に、そのまま効くお話になると思います。\n" +
    "（所要：約４５秒）"
  );
}

/* ================= 2. WHAT IT WAS ================= */
{
  const s = lightSlide(2, "日本初のＭａａＳサブスク", "何をやったか");
  const items = [
    ["期　間", "2020.09 → 2021.01"],
    ["対　象", "マンション１棟の住民"],
    ["手　段", "カーシェア／シェアサイクル\nバス／タクシー"],
    ["課　金", "月額定額"],
    ["アプリ", "Whim（フィンランド）"],
    ["位置づけ", "都市近郊型のモデル"],
  ];
  const gw = (CW - 0.6) / 3, gh = 1.85, gy0 = 2.0;
  items.forEach((it, i) => {
    const x = M + (i % 3) * (gw + 0.3);
    const y = gy0 + Math.floor(i / 3) * (gh + 0.3);
    card(s, x, y, gw, gh);
    s.addText(it[0], {
      isTextBox: true, x: x + 0.3, y: y + 0.24, w: gw - 0.6, h: 0.36,
      fontFace: F, fontSize: 14, bold: true, color: TEAL, margin: 0,
    });
    s.addText(it[1], {
      isTextBox: true, x: x + 0.3, y: y + 0.66, w: gw - 0.6, h: 1.08,
      fontFace: F, fontSize: 17, bold: true, color: INK, margin: 0, lineSpacingMultiple: 1.2,
    });
  });
  s.addText("同時に　日本橋＝都心型　／　豊洲＝準都心型　でも実施　―　柏の葉が第１弾", {
    isTextBox: true, x: M, y: 6.22, w: CW, h: 0.5,
    fontFace: F, fontSize: 16, color: INK, align: "center", margin: 0,
  });

  s.addNotes(
    "●概要です。２０２０年９月１２日から翌年の１月末まで。\n" +
    "●対象は、ザ・ゲートタワーウエストという、たった１棟の住民だけでした。\n" +
    "●使えたのは、カーシェア、シェアサイクル、バス、タクシーの最大４種類。これを月額定額で使い放題にします。\n" +
    "●アプリはフィンランドのＭａａＳグローバル社の「Ｗｈｉｍ」というものです。\n" +
    "●三井不動産は同時に、日本橋と豊洲でもやっています。柏の葉が都市近郊型、日本橋が都心型、豊洲が準都心型。３つの街を比較する設計でした。そして柏の葉が第１弾です。\n" +
    "●一点だけ補足します。私は電動キックボードも使っていたのですが、あれはこの実証のメニューには入っておりません。柏の葉では別のプロジェクトとして実証されていました。混ざりやすいので、分けてお話しします。\n" +
    "（所要：約１分１５秒）"
  );
}

/* ================= 3. SEVEN GATES ================= */
{
  const s = lightSlide(3, "使い始めるまでに７つの関門", "参加するまで");
  const gates = ["公募に応募", "選考・当選", "説明会に出席", "クレカ登録", "免許証の提示", "アプリ導入", "ＬＩＮＥ登録"];
  const hard = [false, true, true, true, false, false, true];
  const gw = (CW - 0.3 * 3) / 4, gh = 1.25;
  gates.forEach((g, i) => {
    const col = i % 4, row = Math.floor(i / 4);
    const x = M + col * (gw + 0.3) + (row === 1 ? (gw + 0.3) * 0.5 : 0);
    const y = 2.05 + row * (gh + 0.3);
    card(s, x, y, gw, gh, hard[i] ? "FBE7D8" : PALE);
    chip(s, String(i + 1), x + 0.28, y + 0.26, 0.42, hard[i] ? ORANGE : TEAL);
    s.addText(g, {
      isTextBox: true, x: x + 0.28, y: y + 0.72, w: gw - 0.56, h: 0.48,
      fontFace: F, fontSize: 18, bold: true, color: INK, margin: 0,
    });
  });
  s.addText("「アプリを配れば使われる」では、ありませんでした", {
    isTextBox: true, x: M, y: 5.28, w: CW, h: 0.78,
    fontFace: F, fontSize: 30, bold: true, color: ORANGE, align: "center", margin: 0,
  });
  s.addText("裏側には、コミュニティマネージャーが１名。ＬＩＮＥは２系統。", {
    isTextBox: true, x: M, y: 6.10, w: CW, h: 0.5,
    fontFace: F, fontSize: 16, color: INK, align: "center", margin: 0,
  });

  s.addNotes(
    "●ここからが、たぶん資料には載っていないお話です。\n" +
    "●私の手元に、当時の運営事務局から届いたメールが８通残っておりました。それを並べ直すと、使い始めるまでに７つの関門があったことが分かります。\n" +
    "●まず公募に応募します。選考があります。当たると説明会の案内が来て、この説明会に出ないと参加できません。土曜の朝１０時から、ＫＯＩＬスタジオで１時間でした。\n" +
    "●持ち物は、スマホと、クレジットカードと、運転免許証。その場でアプリを入れて登録します。\n" +
    "●さらにＬＩＮＥに登録すると、コミュニティマネージャーからクーポンコードが送られてきて、ようやく使えるようになります。\n" +
    "●つまり、ＬＩＮＥに入らないとサービスが始まらないんですね。\n" +
    "●裏側には、コミュニティマネージャーが１名、常駐していました。ＬＩＮＥは２系統。片方がコミュニティ用、もう片方が不具合報告用です。\n" +
    "●トラブル対応だけでなく、柏レイソルの観戦チケットが当たるキャンペーンや、柏の葉公園でプロのカメラマンを呼んだ家族撮影会まで企画していました。\n" +
    "●何が言いたいかというと、「アプリを配れば使われる」ではなかった、ということです。ＤＸという言葉の裏側は、完全に人手の仕事でした。\n" +
    "（所要：約１分３０秒）"
  );
}

/* ================= 4. THE PIVOT (dark) ================= */
{
  const s = darkSlide();
  s.addText("当事者として", {
    isTextBox: true, x: M, y: 0.9, w: CW, h: 0.4,
    fontFace: F, fontSize: 16, bold: true, color: TEAL_L, align: "center", margin: 0,
  });
  s.addText("カーシェアも、シェアサイクルも、バスも、タクシーも。全部使いました。", {
    isTextBox: true, x: M, y: 1.68, w: CW, h: 0.66,
    fontFace: F, fontSize: 22, color: "BFE0D8", align: "center", margin: 0,
  });
  s.addText("ＵＩは、良かった。", {
    isTextBox: true, x: M, y: 2.75, w: CW, h: 1.0,
    fontFace: F, fontSize: 48, bold: true, color: W, align: "center", margin: 0,
  });
  s.addText("それでも、続かなかった。", {
    isTextBox: true, x: M, y: 3.85, w: CW, h: 1.0,
    fontFace: F, fontSize: 48, bold: true, color: W, align: "center", margin: 0,
  });
  s.addText("技術の失敗でも、ＵＸの失敗でもありません", {
    isTextBox: true, x: M, y: 5.55, w: CW, h: 0.64,
    fontFace: F, fontSize: 24, bold: true, color: ORANGE, align: "center", margin: 0,
  });

  s.addNotes(
    "●で、私はどうだったか。全部使いました。カーシェアも、シェアサイクルも、バスの乗り放題も、タクシーも。別実証のキックボードもです。\n" +
    "●アプリのＵＩは良かったです。使い勝手も良かった。目的地を検索して、予約して、決済して、乗るところまで、１つのアプリで完結します。ストレスはほとんどありませんでした。\n" +
    "●それでも、続きませんでした。\n" +
    "（ここで一拍おく）\n" +
    "●ここが、この事例のいちばん重要なところだと思っています。\n" +
    "●つまりこれは、技術の失敗でも、ＵＸの失敗でもないんです。だからこそ、同じ設計をすれば、別の街でも同じことが起きます。\n" +
    "（所要：約１分１５秒）"
  );
}

/* ================= 5. FOUR REASONS ================= */
{
  const s = lightSlide(5, "続かなかった４つの理由", "失敗要因");
  const rs = [
    ["無料だったから使った", "有料になったら、使うかどうかは微妙でした"],
    ["街が便利すぎた", "利用は月１回程度。定額の元が取れません"],
    ["目的地が、近すぎた", "シェアが活きるのは、離れていて不便な場所です"],
    ["エリアを跨げなかった", "柏市内や野田方面まで跨げたら、違いました"],
  ];
  const gw = (CW - 0.3) / 2, gh = 1.62, gy0 = 1.95;
  rs.forEach((r, i) => {
    const x = M + (i % 2) * (gw + 0.3);
    const y = gy0 + Math.floor(i / 2) * (gh + 0.3);
    card(s, x, y, gw, gh);
    chip(s, String(i + 1), x + 0.32, y + 0.3, 0.42, ORANGE);
    s.addText(r[0], {
      isTextBox: true, x: x + 0.95, y: y + 0.26, w: gw - 1.3, h: 0.54,
      fontFace: F, fontSize: 22, bold: true, color: INK, margin: 0,
    });
    s.addText(r[1], {
      isTextBox: true, x: x + 0.95, y: y + 0.84, w: gw - 1.3, h: 0.72,
      fontFace: F, fontSize: 15, color: "6E7F8C", margin: 0, lineSpacingMultiple: 1.2,
    });
  });
  s.addText("狭いエリアの中だけで完結するＭａａＳは、成立しにくい", {
    isTextBox: true, x: M, y: 5.72, w: CW, h: 0.72,
    fontFace: F, fontSize: 28, bold: true, color: TEAL, align: "center", margin: 0,
  });

  s.addNotes(
    "●なぜ続かなかったのか。私なりに４つあると思っています。\n" +
    "●１つめ。無料だったから使った。実証期間中は無償だったんです。じゃあ有料になったときに使うかというと、正直、微妙でした。\n" +
    "●２つめ。街が便利すぎた。柏の葉は本当に便利な街で、バスやタクシーに乗って柏市のほうに出る機会が、そもそも少ないんです。私の利用は月に１回程度。それでは月額定額の元が取れません。\n" +
    "●３つめ。目的地が近すぎた。シェアサイクルや電動キックボードが本当に活きるのは、住まいと商業施設と勤務地が、ある程度離れていて不便な場所なんですよ。柏の葉は、それらが離れていなかった。\n" +
    "●４つめ。エリアを跨げなかった。これが柏市内や野田方面まで跨いで使えていたら、話は全然違ったと思います。１棟・１エリアに閉じた設計そのものに、限界がありました。\n" +
    "●まとめると、狭いエリアの中だけで完結するＭａａＳは、成立しにくい。これが私の結論です。\n" +
    "●皆さんが吹田・豊中で考えておられる分散型拠点も、拠点同士がどれくらい離れているかで、成否が変わると思います。\n" +
    "（所要：約３分）"
  );
}

/* ================= 6. OPERATORS WERE IMPROVISING ================= */
{
  const s = lightSlide(6, "運営も走りながら直していた", "現場のリアル");
  const rows = [
    "無償期間を、途中で延長した",
    "無償から有償へ、自動では移行しなかった",
    "料金ルールの説明が、どんどん長くなった",
    "住民の声は、全件ヘルシンキ本社が読んでいた",
  ];
  rows.forEach((t, i) => {
    const y = 1.95 + i * 0.72;
    chip(s, String(i + 1), M, y, 0.42, TEAL);
    s.addText(t, {
      isTextBox: true, x: M + 0.66, y: y - 0.05, w: CW - 0.66, h: 0.56,
      fontFace: F, fontSize: 21, bold: true, color: INK, margin: 0,
    });
  });
  card(s, M, 5.0, CW, 1.35, PALE);
  s.addText("柏の葉のユーザーフィードバックを受けて、東京の実証では\n自由度の高いプランを導入した", {
    isTextBox: true, x: M + 0.45, y: 5.12, w: CW - 0.9, h: 0.92,
    fontFace: F, fontSize: 18, bold: true, color: TEAL, align: "center", margin: 0, lineSpacingMultiple: 1.2,
  });
  s.addText("三井不動産　プレスリリース　2020.12.15", {
    isTextBox: true, x: M + 0.45, y: 5.96, w: CW - 0.9, h: 0.42,
    fontFace: F, fontSize: 14, color: "6E7F8C", align: "center", margin: 0,
  });
  s.addText("柏の葉は、実験の実験台でした", {
    isTextBox: true, x: M, y: 6.56, w: CW, h: 0.56,
    fontFace: F, fontSize: 20, bold: true, color: ORANGE, align: "center", margin: 0,
  });

  s.addNotes(
    "●運営側も手探りでした。\n" +
    "●無償期間は、途中で延長されています。当初の予定を１０月末まで伸ばしました。まだ判断材料が足りなかったということでしょう。\n" +
    "●そして無償から有償に移るとき、自動では移行しませんでした。有償実証は登録し直しです。ここは相当な数が抜けたはずです。\n" +
    "●料金ルールの説明も、だんだん難しくなっていきました。「予約を実施した時点の期間が適用される」「７２時間の枠がある」「超えた分はカードに課金される」。案内メールの但し書きが、回を追うごとに長くなっていきます。定額制の会計設計が、利用者の理解を超えていたのだと思います。\n" +
    "●一方で良かったのは、私たちのフィードバックを全件、ヘルシンキの本社が読んでいたことです。形式的なアンケートではなく、住民の声を直接開発に返す体制でした。\n" +
    "●その結果がこれです。プレスリリースに、こう書いてあります。「柏の葉のユーザーフィードバックを受けて、東京の実証では、ユーザーの使い方に高い自由度を持たせたプランを導入した」。\n" +
    "●つまり柏の葉は、実験の実験台だったわけです。\n" +
    "（所要：約１分４５秒）"
  );
}

/* ================= 7. AFTERMATH ================= */
{
  const s = lightSlide(7, "構想は正しかった", "その後");
  const tl = [
    ["2019.04", "ＭａａＳグローバル社へ出資", false],
    ["2020.09", "柏の葉で第１弾", false],
    ["2021.12", "自社サービス「＆ＭＯＶＥ」を開始", false],
    ["2023.06", "Ｗｈｉｍの日本サービス、一時休止", true],
    ["2024.03", "ＭａａＳグローバル社、破産申請", true],
    ["現　在", "柏の葉に、定額制ＭａａＳの実装はありません", true],
  ];
  tl.forEach((r, i) => {
    const y = 1.95 + i * 0.66;
    s.addShape(pres.ShapeType.ellipse, {
      x: M + 0.06, y: y + 0.13, w: 0.2, h: 0.2,
      fill: { color: r[2] ? ORANGE : TEAL }, line: { type: "none" },
    });
    s.addText(r[0], {
      isTextBox: true, x: M + 0.45, y: y - 0.04, w: 1.7, h: 0.54,
      fontFace: F, fontSize: 17, bold: true, color: r[2] ? ORANGE : TEAL, margin: 0,
    });
    s.addText(r[1], {
      isTextBox: true, x: M + 2.25, y: y - 0.04, w: CW - 2.25, h: 0.54,
      fontFace: F, fontSize: 19, bold: r[2], color: r[2] ? ORANGE : INK, margin: 0,
    });
  });
  s.addText("街のサービスを、外部のプラットフォームに預けることのリスク", {
    isTextBox: true, x: M, y: 6.22, w: CW, h: 0.62,
    fontFace: F, fontSize: 22, bold: true, color: INK, align: "center", margin: 0,
  });

  s.addNotes(
    "●その後どうなったか、時系列で申し上げます。\n" +
    "●２０１９年に三井不動産がＭａａＳグローバル社に出資。２０２０年に柏の葉で第１弾。１２月に日本橋と豊洲へ拡大します。\n" +
    "●２０２１年１２月には、三井不動産が自社サービス「アンドムーブ」を立ち上げています。ららぽーと豊洲では、買い物額の５％を交通費として還元するところまでやっています。\n" +
    "●ところが２０２３年６月、Ｗｈｉｍの日本サービスが一時休止します。コロナ禍とウクライナ侵攻で、フィンランド本社の資金調達力が落ちたためです。\n" +
    "●そして２０２４年３月、ＭａａＳグローバル社が破産申請しました。\n" +
    "●今、柏の葉に定額制ＭａａＳの実装サービスはありません。モビリティの主軸は自動運転バスに移っています。\n" +
    "●教訓は、街のサービスを外部のプラットフォームに預けることのリスクです。三井不動産が自前のアンドムーブに舵を切ったのは、この破綻の前でした。\n" +
    "（所要：約１分３０秒　※他社の経営は論評せず、事実として述べる）"
  );
}

/* ================= 8. WHAT IF ================= */
{
  const s = lightSlide(8, "交通だけで課金した", "もし、こうだったら");
  card(s, M, 1.88, CW, 1.28, "E3F1EE");
  s.addText("家賃に、都内までのつくばエクスプレスのチケットが含まれていたら？", {
    isTextBox: true, x: M + 0.4, y: 2.02, w: CW - 0.8, h: 1.0,
    fontFace: F, fontSize: 23, bold: true, color: TEAL_D, align: "center", valign: "middle", margin: 0,
  });

  const cw2 = (CW - 0.4) / 2;
  const cols = [
    ["もし実現していたら", TEAL, ["マンションの付加価値になる", "都内に住むより、得になる", "使わない月の損得が消える"]],
    ["実際にやったこと", ORANGE, ["交通サービス単体の月額サブスク", "毎月「元が取れたか」を計算させる", "月１回の利用では、必ず負ける"]],
  ];
  cols.forEach((c, i) => {
    const x = M + i * (cw2 + 0.4);
    card(s, x, 3.35, cw2, 2.1, PALE);
    s.addText(c[0], {
      isTextBox: true, x: x + 0.35, y: 3.54, w: cw2 - 0.7, h: 0.5,
      fontFace: F, fontSize: 18, bold: true, color: c[1], margin: 0,
    });
    s.addText(c[2].map((t, k) => ({ text: t, options: { bullet: true, breakLine: k < c[2].length - 1 } })), {
      isTextBox: true, x: x + 0.35, y: 4.08, w: cw2 - 0.7, h: 1.28,
      fontFace: F, fontSize: 16, color: INK, margin: 0, paraSpaceAfter: 10,
    });
  });
  s.addText("プレスリリースには “Real Estate as a Service” と書かれていました", {
    isTextBox: true, x: M, y: 5.92, w: CW, h: 0.56,
    fontFace: F, fontSize: 18, color: INK, align: "center", margin: 0,
  });

  s.addNotes(
    "●最後にひとつ、当時、三井不動産の方と話していて「これは面白い」と思ったお話をします。実施された施策ではなく、あくまで会話の中で出たアイデアです。\n" +
    "●柏の葉のマンションを借りると、都内の勤務先までのつくばエクスプレスのチケットが、家賃に含まれている。そういうビジネスモデルだったらどうか、という話でした。\n" +
    "●これ、実現していたらマンションそのものの付加価値になりますよね。都内の高い物件に住むより、こちらに住むほうがトータルで得になる。\n" +
    "●そして何より、交通費が「住むことの一部」になるので、使わない月の損得が消えるんです。\n" +
    "●実際にやったのは、交通サービス単体の月額サブスクでした。だから利用者は毎月「今月は元が取れたか」を計算してしまう。月１回の利用では、必ず負けます。\n" +
    "●面白いのは、構想としては最初から書かれていたことです。プレスリリースには「リアル・エステート・アズ・ア・サービス」、「立地に左右されない移動の利便性」という言葉が並んでいます。構想は正しかった。実装が、交通単体に留まったということです。\n" +
    "●皆さんが公園・駅・病院といった既存ストックを拠点にされるなら、その施設側の便益と交通の便益を合算できないか、という発想は使えるかもしれません。\n" +
    "（所要：約１分３０秒）"
  );
}

/* ================= 9. SIX TAKEAWAYS ================= */
{
  const s = lightSlide(9, "持ち帰っていただきたい６つ", "分散型モビリティ拠点へ");
  const ts = [
    ["拠点間の距離", "近すぎると成立しません"],
    ["需要量から逆算", "月に何回使うのかを先に置く"],
    ["エリアを跨ぐ", "閉じると立ち上がる前に終わる"],
    ["運営する人のコスト", "誰が毎日これを回すのか"],
    ["交通単体で課金しない", "施設側の便益と合算する"],
    ["自動運転は2030年以降", "今のレベル２では人は減らない"],
  ];
  const gw = (CW - 0.6) / 3, gh = 1.85, gy0 = 2.0;
  ts.forEach((t, i) => {
    const x = M + (i % 3) * (gw + 0.3);
    const y = gy0 + Math.floor(i / 3) * (gh + 0.3);
    card(s, x, y, gw, gh);
    chip(s, String(i + 1), x + 0.3, y + 0.26, 0.42, TEAL);
    s.addText(t[0], {
      isTextBox: true, x: x + 0.3, y: y + 0.80, w: gw - 0.6, h: 0.52,
      fontFace: F, fontSize: 20, bold: true, color: INK, margin: 0,
    });
    s.addText(t[1], {
      isTextBox: true, x: x + 0.3, y: y + 1.30, w: gw - 0.6, h: 0.5,
      fontFace: F, fontSize: 15, color: "6E7F8C", margin: 0,
    });
  });
  s.addText("当面の拠点構想は有人前提で。無人化は、後から載せられる形に。", {
    isTextBox: true, x: M, y: 6.22, w: CW, h: 0.5,
    fontFace: F, fontSize: 17, color: INK, align: "center", margin: 0,
  });

  s.addNotes(
    "●持ち帰っていただきたいことを、６つにまとめました。\n" +
    "●１つめ。拠点間の距離が、いちばん効く設計変数です。近すぎる街ではシェアモビリティは成立しません。吹田・豊中で「どこがどう不便か」を先に測ることをおすすめします。\n" +
    "●２つめ。課金設計は、需要量から逆算してください。月に何回使うのかを先に置く。月１回の需要に月額定額を載せると、利用者は毎月「損」を計算します。\n" +
    "●３つめ。エリアを跨げる設計にしてください。１拠点・１エリアで閉じると、便利さが立ち上がる前に終わります。\n" +
    "●４つめ。「人が運営するコスト」を最初から見込んでください。コミュニティマネージャー１名とＬＩＮＥ２系統。これがないと回りませんでした。\n" +
    "●５つめ。交通単体で課金しない道を探してください。家賃、医療、商業と束ねる。分散型拠点を公園・駅・病院に置かれるなら、なおさら可能性があります。\n" +
    "●６つめ。自動運転は、２０３０年以降の話として置いてください。運転士不足は全国共通の問題で、鉄道はワンマンから無人運転へ、バスはレベル４へという流れがあります。トヨタも２０３０年頃に業務用のものを出してくると聞いています。\n" +
    "●ただ、今はレベル２が主流で、保安要員が必要です。つまり人手不足の解消にはなっていません。当面の拠点構想は有人前提で設計して、無人化は後から載せられる形にしておくのが現実的だと思います。\n" +
    "（所要：約２分）"
  );
}

/* ================= 10. CLOSING (dark) ================= */
{
  const s = darkSlide();
  s.addText("おわりに", {
    isTextBox: true, x: M, y: 0.75, w: CW, h: 0.4,
    fontFace: F, fontSize: 16, bold: true, color: TEAL_L, align: "center", margin: 0,
  });
  s.addText("失敗の解像度を", {
    isTextBox: true, x: M, y: 1.35, w: CW, h: 1.1,
    fontFace: F, fontSize: 48, bold: true, color: W, align: "center", margin: 0,
  });
  s.addText("柏の葉がお渡しできるのは、成功モデルではありません", {
    isTextBox: true, x: M, y: 2.52, w: CW, h: 0.56,
    fontFace: F, fontSize: 20, color: "BFE0D8", align: "center", margin: 0,
  });

  s.addText("逆に、皆さんに伺いたいこと", {
    isTextBox: true, x: M, y: 3.48, w: CW, h: 0.5,
    fontFace: F, fontSize: 16, bold: true, color: ORANGE, align: "center", margin: 0,
  });
  const qs = [
    "住まいと目的地は、どれくらい離れて、どう不便ですか",
    "拠点の運営は、誰が担う想定ですか",
    "交通以外の、何と束ねて採算を取りますか",
  ];
  qs.forEach((q, i) => {
    const y = 4.1 + i * 0.72;
    chip(s, "Q" + (i + 1), 2.15, y, 0.46, TEAL_L);
    s.addText(q, {
      isTextBox: true, x: 2.9, y: y - 0.04, w: 8.6, h: 0.6,
      fontFace: F, fontSize: 21, color: W, margin: 0,
    });
  });

  s.addNotes(
    "●柏の葉がお渡しできるのは、成功モデルではなく、失敗の解像度です。\n" +
    "●この街のモビリティは、試行錯誤と頓挫の積み重ねです。\n" +
    "●それでも公民学の連携が１５年以上続いているのは、失敗を共有できる場があったからだと思っています。それがＵＤＣＫです。\n" +
    "●逆に、皆さんに伺いたいことが３つあります。\n" +
    "●１つめ。吹田・豊中で、住まいと目的地はどれくらい離れて、どう不便なのでしょうか。\n" +
    "●２つめ。分散型拠点の運営は、誰が担う想定ですか。阪急バスさんですか、自治体ですか、それとも施設側でしょうか。\n" +
    "●３つめ。その拠点は、交通以外の何と束ねて採算を取る設計になっていますか。\n" +
    "●ぜひ、お聞かせください。\n" +
    "（所要：約４５秒　→　このまま質疑へ）"
  );
}

pres.writeFile({ fileName: process.argv[2] }).then(f => console.log("written:", f));
