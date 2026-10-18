/**
 * Hook, lesson cards and today's-stop line for the stations that keep their
 * existing quiz (the "wrapped" stations). Every card is cut from the station's
 * article in components/lessons/Module<N>.tsx; nothing here adds a fact or a
 * number the article does not already have. The quiz in lib/modules.ts runs
 * after the cards, so the cards teach what it asks without quoting its answers.
 */

import type { Hook, LessonCard } from "@/lib/tasks/types";

export interface WrappedStationCopy {
  hook: Hook;
  lessonCards: LessonCard[];
  doLine: string;
}

export const WRAPPED_STATIONS: Record<number, WrappedStationCopy> = {
  // 新聞站：看懂財經新聞的幾個詞
  42: {
    hook: {
      question: "看到新聞寫「殖利率 5%」，你的第一個感覺是？",
      options: [
        { id: "buy", label: "好像該買" },
        { id: "lost", label: "看不懂在說什麼" },
        { id: "check", label: "先查查是什麼意思" },
      ],
    },
    lessonCards: [
      {
        kind: "text",
        title: "加權指數：整個市場的分數",
        body: "把所有上市股票放在一起算，市值越大的公司，影響越大。指數漲了，不代表每一檔都漲，可能只是幾家大公司漲得多。",
      },
      {
        kind: "text",
        title: "本益比、殖利率，都是除法",
        body: "EPS 是每一股分到的獲利。本益比＝股價 ÷ EPS，殖利率＝每股股利 ÷ 股價。虛構的晴光電子：100 ÷ 5 ＝ 20 倍。",
      },
      {
        kind: "text",
        title: "除息：錢從股價搬到帳戶",
        body: "除息那天，參考價會先扣掉配出去的現金。前一天收 100 元、配 3 元，參考價就是 97 元。漲回去，才算真的多了。",
      },
    ],
    doLine: "看懂新聞裡的詞，答三題",
  },

  // 人頭站：人頭帳戶與車手
  10: {
    hook: {
      question: "同學說借你的帳戶收一筆錢，事後給你 NT$3,000，你的第一反應是？",
      options: [
        { id: "help", label: "幫個忙，沒差" },
        { id: "ask", label: "有點怪，先問清楚" },
        { id: "no", label: "直接拒絕" },
      ],
    },
    lessonCards: [
      {
        kind: "text",
        title: "借帳戶，就是當人頭",
        body: "你的帳戶會被拿去收詐騙的錢。就算你不知情，一旦變成警示帳戶，名下其他帳戶也不能用提款卡和網路轉帳，還會留下聯徵紀錄。",
      },
      {
        kind: "text",
        title: "收了好處，就不只是告誡",
        body: "洗錢防制法第 22 條：第一次交出帳戶，會被警察告誡。收了好處、一次交出三個以上，或五年內再犯，就可能被判刑。",
      },
      {
        kind: "text",
        title: "車手：領錢、轉交的打工",
        body: "拿別人的提款卡去領錢，或向陌生人收一袋現金再轉交。正常的公司不會這樣做，工作內容本身就是警訊。",
      },
    ],
    doLine: "看清借帳戶的代價，答三題",
  },

  // 個資站：個資怎麼外流的
  13: {
    hook: {
      question: "詐騙電話叫得出你的全名，你會覺得？",
      options: [
        { id: "targeted", label: "我被特別盯上了" },
        { id: "leak", label: "資料可能外流了" },
        { id: "unsure", label: "不知道，好可怕" },
      ],
    },
    lessonCards: [
      {
        kind: "text",
        title: "個資從哪裡流出去",
        body: "不明連結裡的表單、要太多權限的 App、購物網站的資料外洩，連公開的社群貼文，都可能被蒐集利用。",
      },
      {
        kind: "text",
        title: "不點連結，還不夠",
        body: "合法網站也會外洩，朋友帳號也可能被盜。收到奇怪的訊息，先打電話問本人。保持警覺是習慣，不是做一次就好。",
      },
    ],
    doLine: "找出個資外流的管道，答三題",
  },

  // 學費站：公立 vs 私立四年真實總價
  14: {
    hook: {
      question: "選大學時，你會先看學費嗎？",
      options: [
        { id: "yes", label: "會，很在意" },
        { id: "later", label: "先看校系，錢之後再說" },
        { id: "parents", label: "爸媽會處理" },
      ],
    },
    lessonCards: [
      {
        kind: "text",
        title: "看四年總價，不是一學期",
        body: "大部分人只看一學期要繳多少。乘上 8 個學期，再加上住宿和交通，才是選校選系時真正該比的數字。",
      },
      {
        kind: "text",
        title: "公私立，差距不小",
        body: "教育部 112 年資料：私立大專一年學雜費平均比公立多將近 5 萬元。113 年起私立每學期可減免 1.75 萬元，差距變小，但還在。",
      },
    ],
    doLine: "算出四年的真實總價，答兩題",
  },

  // 住宿站：住宿 vs 租屋 vs 通勤
  16: {
    hook: {
      question: "上大學以後，你最想怎麼住？",
      options: [
        { id: "dorm", label: "住宿舍" },
        { id: "rent", label: "在外面租屋" },
        { id: "commute", label: "從家裡通勤" },
      ],
    },
    lessonCards: [
      {
        kind: "text",
        title: "三種住法，各有取捨",
        body: "宿舍通常最便宜，但名額有限、比較不自由。租屋比較貴，但彈性大。通勤省下房租，但要算交通費和時間。",
      },
      {
        kind: "text",
        title: "月租之外的錢",
        body: "押金通常是 1 到 2 個月租金，還有水電雜費，通勤花掉的時間也是成本。只看月租，最容易低估。",
      },
    ],
    doLine: "比一比三種住法，答兩題",
  },

  // 打工站：打工的機會成本
  17: {
    hook: {
      question: "上大學以後有空檔，你會想打工嗎？",
      options: [
        { id: "yes", label: "會，多賺一點" },
        { id: "depends", label: "看課業再決定" },
        { id: "no", label: "應該不會" },
      ],
    },
    lessonCards: [
      {
        kind: "text",
        title: "機會成本：你放棄的那段時間",
        body: "打工的時薪，要跟同一段時間拿去讀書、準備實習、參加社團的價值比。不是打工不好，是要知道自己在用時間換什麼。",
      },
      {
        kind: "text",
        title: "大一大二，先打基礎",
        body: "長期來看，實習經驗和成績對起薪的影響，可能比打工存下的錢大得多。",
      },
    ],
    doLine: "算算打工的機會成本，答兩題",
  },

  // 獎學金站：獎助學金與校內資源
  18: {
    hook: {
      question: "你覺得自己有機會拿到獎學金嗎？",
      options: [
        { id: "yes", label: "有機會" },
        { id: "no", label: "成績不夠好，應該沒有" },
        { id: "never", label: "從來沒想過" },
      ],
    },
    lessonCards: [
      {
        kind: "text",
        title: "免費的錢，很多人沒去拿",
        body: "入學獎學金、系所獎學金、清寒助學金、緊急紓困金。很多學生因為不知道或嫌麻煩，就沒有申請。",
      },
      {
        kind: "text",
        title: "不是只給第一名",
        body: "很多助學金看的是家庭經濟狀況或特定條件。開學後花 10 分鐘查一次校內公告，很值得。",
      },
    ],
    doLine: "找出你能申請的錢，答兩題",
  },

  // 薪資單站：你的薪水被扣了什麼
  19: {
    hook: {
      question: "合約寫月薪 NT$30,000，實領卻比較少，你的第一個念頭是？",
      options: [
        { id: "short", label: "公司少給我錢" },
        { id: "deducted", label: "應該是被扣了什麼" },
        { id: "unsure", label: "不知道" },
      ],
    },
    lessonCards: [
      {
        kind: "text",
        title: "實領為什麼比較少",
        body: "每個月會先扣勞保費、健保費；有勞退自提的話，也會一起扣。薪水比較高的人，還會被預扣所得稅。看懂這幾項，才看得懂薪資單。",
      },
      {
        kind: "text",
        title: "被扣的錢，不是被公司拿走",
        body: "勞保、健保是保險。勞退自提存進你自己的退休金專戶，最後還是你的錢。雇主另外還要提繳，不得低於 6%，不能從你的薪水扣。",
      },
    ],
    doLine: "看懂薪資單的扣款，答兩題",
  },

  // 級距站：免稅額、扣除額、級距
  20: {
    hook: {
      question: "加薪後跳進更高的稅率級距，你覺得會不會反而拿得更少？",
      options: [
        { id: "yes", label: "會，有點怕" },
        { id: "no", label: "不會" },
        { id: "unsure", label: "不確定" },
      ],
    },
    lessonCards: [
      {
        kind: "flow",
        title: "要繳稅的錢，怎麼算出來",
        steps: [
          "一年的所得",
          "先扣掉免稅額",
          "再扣掉標準扣除額",
          "剩下的是所得淨額",
          "所得淨額分段算稅",
        ],
      },
      {
        kind: "text",
        title: "分段算，不是全部套高稅率",
        body: "綜所稅分 5%、12%、20%、30%、40% 五個級距。每一段各課自己的稅率，跳上新級距，前面那幾段的稅率不會變。",
      },
    ],
    doLine: "搞懂累進稅率怎麼算，答兩題",
  },

  // 憑單站：打工學生的扣繳憑單
  21: {
    hook: {
      question: "打工的公司寄來一張扣繳憑單，你會怎麼做？",
      options: [
        { id: "keep", label: "收好" },
        { id: "toss", label: "看一眼就丟" },
        { id: "unknown", label: "不知道那是什麼" },
      ],
    },
    lessonCards: [
      {
        kind: "text",
        title: "扣繳憑單，是你的所得證明",
        body: "不管賺多少，雇主都要開給你，沒扣到稅的叫免扣繳憑單。它證明你這一年賺了多少，報稅、辦助學貸款時都可能要用。",
      },
      {
        kind: "text",
        title: "第一次拿到，先看這幾格",
        body: "所得類別、給付總額、扣繳稅額、給付單位統一編號。看不懂很正常，先確認姓名、身分證字號和金額沒有錯。",
      },
    ],
    doLine: "看懂扣繳憑單，答兩題",
  },

  // 扶養站：扶養與家庭申報
  22: {
    hook: {
      question: "你覺得報稅只是爸媽的事，還是也跟你有關？",
      options: [
        { id: "parents", label: "爸媽的事" },
        { id: "mine", label: "跟我也有關" },
        { id: "never", label: "沒想過" },
      ],
    },
    lessonCards: [
      {
        kind: "text",
        title: "還在念書，通常列在爸媽那裡",
        body: "未滿一定年齡或還在就學的子女，通常會列為父母的受扶養親屬，跟著一起申報，不是自己單獨報稅。",
      },
      {
        kind: "text",
        title: "家人先講好，誰報哪些",
        body: "各自申報又沒溝通，同一個人可能被重複列報，或該報的漏掉。每年報稅前，家人先說好由誰申報哪些項目。",
      },
    ],
    doLine: "搞懂家裡怎麼報稅，答兩題",
  },

  // 補充保費站：二代健保補充保費
  23: {
    hook: {
      question: "每個月都繳了健保費，領到股利還要再扣一次健保，你覺得？",
      options: [
        { id: "unfair", label: "不合理" },
        { id: "fair", label: "還算合理" },
        { id: "new", label: "第一次聽到" },
      ],
    },
    lessonCards: [
      {
        kind: "text",
        title: "額外的所得，另外扣",
        body: "超過一定金額的獎金、租金收入、股利，會額外扣二代健保補充保費。現在影響不大，以後兼職、投資就會遇到。",
      },
      {
        kind: "compare",
        title: "兩種健保費，不是同一件事",
        left: {
          name: "一般健保費",
          rows: [
            { label: "針對什麼", value: "薪資" },
            { label: "怎麼扣", value: "每月固定從薪資扣" },
          ],
        },
        right: {
          name: "二代健保補充保費",
          rows: [
            { label: "針對什麼", value: "特定的額外所得" },
            { label: "怎麼扣", value: "額外所得達一定金額才扣" },
          ],
        },
        note: "繳了一般健保費，不代表不會再有其他健保扣款。",
      },
    ],
    doLine: "分清兩種健保費，答兩題",
  },

  // 看房站：看房檢查表與房仲費
  24: {
    hook: {
      question: "去看房的時候，你最先注意什麼？",
      options: [
        { id: "rent", label: "房租多少" },
        { id: "looks", label: "房間漂不漂亮" },
        { id: "quiet", label: "安不安靜" },
        { id: "transit", label: "交通方不方便" },
      ],
    },
    lessonCards: [
      {
        kind: "flow",
        title: "看房檢查表",
        steps: [
          "打開水龍頭，試試水壓",
          "看天花板角落有沒有漏水痕跡",
          "白天、晚上各去一次，看採光和噪音",
          "查查附近設施和網路訊號",
        ],
      },
      {
        kind: "text",
        title: "房仲費有上限",
        body: "房仲可以向房東、房客一方或雙方收費。內政部規定，雙方合計最多一個半月租金。這是上限，還可以議價。",
      },
    ],
    doLine: "照著檢查表看房，答兩題",
  },

  // 契約站：內政部定型化契約，哪些條款無效
  25: {
    hook: {
      question: "租約都簽名了，上面寫什麼你都得照做嗎？",
      options: [
        { id: "yes", label: "要，簽了就是簽了" },
        { id: "no", label: "不一定" },
        { id: "unsure", label: "不知道" },
      ],
    },
    lessonCards: [
      {
        kind: "text",
        title: "官方範本，拿來對一對",
        body: "內政部公告了住宅租賃定型化契約應記載及不得記載事項。簽約前，把房東給的合約跟官方範本對照一次。",
      },
      {
        kind: "text",
        title: "有些條款，簽了也不算數",
        body: "押金不能超過 2 個月租金，房客也不用預先放棄終止租約的權利。合約寫了相反的內容，那部分依法無效。",
      },
    ],
    doLine: "認識租約的底線，答兩題",
  },

  // 報稅爭議站：房東說「報稅就漲租金」怎麼辦
  26: {
    hook: {
      question: "房東說「你報稅，我就漲房租」，你會怎麼做？",
      options: [
        { id: "skip", label: "那就不報了" },
        { id: "file", label: "還是照報" },
        { id: "check", label: "先查查自己的權利" },
      ],
    },
    lessonCards: [
      {
        kind: "text",
        title: "申報租金，是你的權利",
        body: "房客依法可以申報租金支出特別扣除額。這是你自己的稅務權益，不是房東可以片面禁止的。",
      },
      {
        kind: "text",
        title: "從列舉，改成特別扣除額",
        body: "房屋租金支出已經從列舉扣除額改成特別扣除額，上限由財政部公告。怕起衝突就放棄，等於白白放掉節稅。",
      },
    ],
    doLine: "認識租金扣除額，答兩題",
  },

  // 修繕站：修繕責任歸屬
  27: {
    hook: {
      question: "租的房子水管漏水了，你會先怎麼做？",
      options: [
        { id: "diy", label: "自己找人修" },
        { id: "tell", label: "先跟房東說" },
        { id: "wait", label: "先忍著" },
      ],
    },
    lessonCards: [
      {
        kind: "compare",
        title: "壞了，誰來修",
        left: {
          name: "通常房東修",
          rows: [
            { label: "什麼情況", value: "非人為的正常損壞" },
            { label: "例子", value: "老舊管線漏水" },
          ],
        },
        right: {
          name: "通常房客修",
          rows: [
            { label: "什麼情況", value: "使用不當造成的損壞" },
            { label: "例子", value: "自己不小心弄壞" },
          ],
        },
        note: "簽約時可以把修繕分工寫清楚，入住後比較不會吵。",
      },
      {
        kind: "text",
        title: "先反應，再決定出不出錢",
        body: "東西壞了，自己默默花錢修，可能付了本該房東負擔的錢。先跟房東反應，確認是誰的責任。",
      },
    ],
    doLine: "分清修繕責任，答兩題",
  },

  // 退租站：退租與押金爭議
  28: {
    hook: {
      question: "退租時房東說要扣押金，你覺得他說了算嗎？",
      options: [
        { id: "yes", label: "他說了算" },
        { id: "depends", label: "要看情況" },
        { id: "no", label: "不行，要全退" },
      ],
    },
    lessonCards: [
      {
        kind: "text",
        title: "押金不能隨便扣",
        body: "房東不能無故扣留押金。只有超出正常使用磨損的實際損壞，才能扣修復費用。押金上限是 2 個月租金。",
      },
      {
        kind: "text",
        title: "搬進去第一天就拍照",
        body: "入住和退租都拍照存證。沒有照片，房東說有損壞時，你很難證明不是自己弄的。",
      },
    ],
    doLine: "學會保住押金，答兩題",
  },

  // 職災站：勞保、勞退、職災的差別
  30: {
    hook: {
      question: "薪資單上的勞保費，你覺得是在幫你存什麼？",
      options: [
        { id: "pension", label: "存退休金" },
        { id: "insurance", label: "買保險" },
        { id: "unsure", label: "不知道" },
      ],
    },
    lessonCards: [
      {
        kind: "text",
        title: "三種制度，三種性質",
        body: "勞保是在職時的社會保險。勞退是雇主每月提撥、屬於你個人的退休金專戶。職災保險專門保障因工作造成的傷病。",
      },
      {
        kind: "text",
        title: "勞保不是退休金",
        body: "勞保理賠的是生育、傷病、失能、老年、死亡這些事件。真正屬於你自己的退休金專戶，是勞退。",
      },
      {
        kind: "text",
        title: "職災保險",
        body: "從 111 年 5 月 1 日起，職災保險從勞保獨立出來，單獨立法。受僱於登記有案事業單位的勞工，不論公司人數多少，都要投保。",
      },
    ],
    doLine: "分清勞保、勞退、職災，答兩題",
  },

  // 儲蓄險站：儲蓄險為什麼一直被推銷
  32: {
    hook: {
      question: "有人說儲蓄險「存錢又有保障」，你聽了會心動嗎？",
      options: [
        { id: "yes", label: "會心動" },
        { id: "doubt", label: "有點懷疑" },
        { id: "unknown", label: "不知道儲蓄險是什麼" },
      ],
    },
    lessonCards: [
      {
        kind: "text",
        title: "保障很低，解約常虧本",
        body: "儲蓄險主要是強迫儲蓄，保障通常很低，提前解約常會虧本。它被大量推銷，原因之一是業務員的佣金通常較高。",
      },
      {
        kind: "text",
        title: "業務員會用的詞",
        body: "預定利率在簽約時就固定。宣告利率會變動，不保證。業務員的試算常用宣告利率，未來不一定照著走。",
      },
      {
        kind: "text",
        title: "一個問題就夠了",
        body: "問業務員：第 6 年或第 10 年解約，報酬率（IRR）是多少？請他給你看解約金表，再拿去跟定存比。",
      },
    ],
    doLine: "拆解儲蓄險的說法，答兩題",
  },

  // 團保站：學生團保
  33: {
    hook: {
      question: "你知道自己在學校有保險嗎？",
      options: [
        { id: "yes", label: "知道" },
        { id: "maybe", label: "好像有" },
        { id: "no", label: "不知道" },
      ],
    },
    lessonCards: [
      {
        kind: "text",
        title: "你可能已經有保險",
        body: "學校通常會統一投保學生團體保險。保費相對便宜，保障多是意外傷害醫療，保額通常不高。",
      },
      {
        kind: "text",
        title: "受傷了，記得申請理賠",
        body: "很多人不知道自己有團保，受傷後沒去申請，白白放棄已經繳過保費的保障。先問學校保單保了什麼。",
      },
    ],
    doLine: "查清楚學生團保，答兩題",
  },

  // 成本站：固定成本 vs 變動成本
  34: {
    hook: {
      question: "開一家飲料攤，你覺得賣越多，一定賺越多嗎？",
      options: [
        { id: "yes", label: "一定" },
        { id: "no", label: "不一定" },
        { id: "unsure", label: "沒想過" },
      ],
    },
    lessonCards: [
      {
        kind: "compare",
        title: "兩種成本",
        left: {
          name: "固定成本",
          rows: [
            { label: "跟著銷量變嗎", value: "不會" },
            { label: "例子", value: "店租、基本人事費" },
          ],
        },
        right: {
          name: "變動成本",
          rows: [
            { label: "跟著銷量變嗎", value: "會，賣越多越多" },
            { label: "例子", value: "原料、包材" },
          ],
        },
        note: "分清楚這兩種，才算得出賣多少才開始賺。",
      },
      {
        kind: "text",
        title: "週轉金：不拿去進貨的現金",
        body: "生意不好的日子，固定成本照樣要付。那時候撐住你的，就是手上留著、沒拿去進貨的週轉金。",
      },
    ],
    doLine: "把攤位成本分兩類，答兩題",
  },

  // 定價站：定價與毛利
  35: {
    hook: {
      question: "要幫一杯飲料訂價，你會怎麼訂？",
      options: [
        { id: "copy", label: "跟隔壁攤一樣" },
        { id: "costplus", label: "成本加一點" },
        { id: "market", label: "看客人願意付多少" },
      ],
    },
    lessonCards: [
      {
        kind: "text",
        title: "毛利：每一杯賺多少",
        body: "毛利＝售價－成本。一杯賣 45 元、原料 15 元，毛利是 30 元。換成比例就是毛利率：30 ÷ 45，約 67%。",
      },
      {
        kind: "text",
        title: "抄得了價格，抄不了成本",
        body: "定價要看市場、對手和客群，但先算清楚自己的成本。照抄別人的售價，抄不到別人的成本優勢。",
      },
    ],
    doLine: "算一杯飲料的毛利，答兩題",
  },

  // 兩平站：損益兩平點
  36: {
    hook: {
      question: "擺攤第一天，你覺得要賣幾杯才會開始賺？",
      options: [
        { id: "few", label: "幾杯就夠了" },
        { id: "many", label: "要賣很多杯" },
        { id: "unsure", label: "完全沒概念" },
      ],
    },
    lessonCards: [
      {
        kind: "text",
        title: "打平的那個點",
        body: "賣到某個數量，收入剛好等於總成本，這就是損益兩平點。超過它，才開始真的賺錢。",
      },
      {
        kind: "text",
        title: "公式只有一行",
        body: "損益兩平點＝固定成本 ÷ 每單位毛利。每杯的毛利先拿去抵固定成本，抵完了，之後每一杯才是賺的。",
      },
    ],
    doLine: "算出要賣幾杯才打平，答兩題",
  },

  // 現金流站：現金流 vs 獲利
  37: {
    hook: {
      question: "帳面上這個月賺了錢，你覺得手上一定有錢可以用嗎？",
      options: [
        { id: "yes", label: "一定有" },
        { id: "no", label: "不一定" },
        { id: "unsure", label: "不確定" },
      ],
    },
    lessonCards: [
      {
        kind: "flow",
        title: "錢的時間差",
        steps: ["進貨，要先付錢", "把商品賣出去", "客戶延後付款", "錢這時才真正進帳"],
      },
      {
        kind: "text",
        title: "有獲利，不代表有現金",
        body: "客戶還沒付款、庫存還沒賣掉，帳面賺了，手上卻可能沒錢。很多小生意，就倒在付不出當下該付的錢。",
      },
      {
        kind: "text",
        title: "留一筆週轉金",
        body: "開店前除了算成本，還要留一筆不拿去進貨、專門應付意外的現金。颱風天沒客人，攤位費還是照付。",
      },
    ],
    doLine: "分清獲利和現金，答兩題",
  },

  // 登記站：商業登記與發票
  38: {
    hook: {
      question: "學生擺攤賺零用錢，你覺得需要去登記嗎？",
      options: [
        { id: "yes", label: "需要" },
        { id: "no", label: "不用吧" },
        { id: "unsure", label: "不知道" },
      ],
    },
    lessonCards: [
      {
        kind: "text",
        title: "合法經營的基本功",
        body: "攤販、每月銷售額沒到營業稅起徵點的小生意，可以不辦商業登記。但有固定地點的攤販，還是要向國稅局設立稅籍。",
      },
      {
        kind: "text",
        title: "越晚補，越麻煩",
        body: "覺得擺攤什麼都不用管？不辦商業登記，不代表不用管稅。等規模變大才補辦，反而更麻煩。提早了解規則，比較安全。",
      },
    ],
    doLine: "認識商業登記，答兩題",
  },

  // 決策站：買房 vs 租屋，三個關卡
  41: {
    hook: {
      question: "你覺得自己以後會買房嗎？",
      options: [
        { id: "early", label: "會，越早越好" },
        { id: "later", label: "有能力再說" },
        { id: "rent", label: "租屋就好" },
        { id: "unsure", label: "沒想過" },
      ],
    },
    lessonCards: [
      {
        kind: "flow",
        title: "買房要連過三關",
        steps: [
          "頭期款夠不夠：看你的存款",
          "月付撐不撐得住：看你的收入",
          "銀行願不願意借：看你的信用記錄",
        ],
      },
      {
        kind: "text",
        title: "頭期款只是入場券",
        body: "銀行通常最多借八成，剩下兩成要自己拿出來。付得出頭期款還不夠，真正要撐三十年的，是每個月的月付和生活。",
      },
      {
        kind: "text",
        title: "利率差一點，時間放很大",
        body: "利率差個零點幾個百分點，乘上三十年就不小了。而利率很大一部分，看的是你前幾年的繳款記錄。",
      },
    ],
    doLine: "看懂買房的三個關卡，答三題",
  },
};
