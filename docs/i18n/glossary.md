# 번역 용어집

조각 문안(`sims/**/schema.ts` 의 `LocalizedText`)을 열 언어로 옮길 때 따르는 표준이다. C1 MUST 「열 언어 필수」와 함께 본다.

## 원칙

- **원문은 en** 이다. en 과 ko 가 다르면 en 을 옮긴다. 둘 중 무엇이 맞는지는 **조각이 구현한 사실**(`physics.ts` · `scene.ts`)로 판정하고, 틀린 쪽을 고친다.
- **같은 뜻의 같은 en 용어는 한 언어 안에서 모든 조각이 같은 번역**을 쓴다. 교육 콘텐츠에서 같은 개념을 조각마다 다르게 부르는 것은 결함이다.
- 표준은 en 의 뜻에서 정한다: 이 용어집 → 그 언어 교과서의 표준 물리 용어 → 용례 다수. 다수결은 en 과 같은 뜻인 표기들 사이에서만 쓴다.
- **물리적 사실이 용어집보다 우선**한다. 용어를 넣어 문장이 조각과 다른 물리를 말하게 되면 넣지 않는다.
- 단위 · 기호 · 수식 · 자리표시(`×`, `°`, `m/s`, `{k}`)는 C1 판정표의 표식이라 en 그대로 둔다.
- 서로 다른 개념은 다른 말로 옮긴다(예: id 그림자 bayang-bayang / 상 bayangan).

## 규칙 표

| en | 규칙 |
|---|---|
| voltage | es voltaje · fr tension · pt tensão · hi वोल्टता · zh 电压 · ja 電圧 |
| potential difference | hi विभवांतर (voltage 와 다른 개념이면) |
| gravity (지표의 무게를 만드는 중력, g) | zh 重力 · ja 重力 · fr pesanteur |
| gravity / gravitational pull (천체 사이 끌림) | zh 引力 · ja 重力 (만유인력 법칙의 이름은 万有引力) · fr gravité |
| speed (스칼라) / velocity (벡터) | es rapidez / velocidad · hi चाल / वेग · id kelajuan / kecepatan · pt velocidade 둘 다 |
| Default (stage · view 이름) | ja 標準 · zh 默认 · ar افتراضي · es Predeterminada · fr Par défaut · hi डिफ़ॉल्ट · id Bawaan · pt Padrão |
| EMF | ja 起電力 · zh 电动势 · es/pt fem · fr f.é.m. · id GGL · hi विद्युत वाहक बल |
| resistor | es resistencia · fr résistance · pt resistor · id hambatan · hi प्रतिरोध |
| 배수 `{k}×` · `×{k}` | **en 에 있는 `×` 는 기호(C1 표식)라 모든 언어에서 그대로 둔다.** ko 표기와 무관. en 이 낱말(twice, times)이면 낱말로 옮긴다 |
| 수 표기 | 숫자 · 자릿수 구분 기호는 en 원문 그대로 |
| 화살표 (ar) | 화면의 실제 방향을 가리키는 화살표는 en 과 같게 둔다. 뒤집지 않는다 |
| heat (에너지로서의 열) | id Kalor · (온도감 · 뜨거움은 panas) |
| potential (퍼텐셜 에너지) | ar طاقة الوضع (الجهد 는 전위 · 전압에만) |
| momentum | es momento lineal · fr quantité de mouvement · pt quantidade de movimento · hi संवेग |
| impulse | ja 力積 · zh 冲量 · ar الدفع · es/pt impulso · fr impulsion · hi आवेग · id impuls |
| pressure | zh 压强 (대기압만 气压) · hi दाब |
| air drag · air resistance (공기 속을 움직일 때 받는 저항) | ja 空気抵抗 · zh 空气阻力 · es resistencia del aire · fr résistance de l’air · pt resistência do ar |
| drag (force) — 유체 일반의 항력 | ja 抗力 · zh 阻力 · fr traînée · es arrastre · pt arrasto |
| 보이지 않는 방향 제어 문자 (U+200E/F, U+202A–E, U+2066–9) | 넣지 않는다 |
| converging / diverging lens (en 이 converging·diverging 일 때) | ja 収束レンズ / 発散レンズ · zh 会聚透镜 / 发散透镜 · ar عدسة مجمعة / مفرقة · es/pt/fr convergente / divergente · hi अभिसारी / अपसारी लेंस · id lensa konvergen / divergen. **다수가 볼록·오목으로 옮겼어도 en 이 converging 이면 수렴으로 옮긴다** |
| convex / concave (en 이 convex·concave 일 때) | ja 凸 / 凹 · zh 凸 / 凹 · hi उत्तल / अवतल · id cembung / cekung · es/pt convexa/côncava 등 |
| shadow / image (광학의 상) | id: shadow **bayang-bayang** · image **bayangan** (서로 다른 개념은 다른 말로) |
| rest frame (정지 틀) | ar إطار السكون · pt referencial de repouso · ja 静止系 (교과서 표준) |
| beam (빛다발) | es haz · fr faisceau · pt feixe · id berkas · ja 光束 · zh 光束 · hi किरण-पुंज · ar حزمة. ray(광선)와 구분. 빛이 아닌 beam(저울대 · 원자빔)은 해당 뜻으로 |

## 용어별 표준 (언어별)

2026-09-24 전수 점검에서 정한 표준이다. 새 조각은 여기 있는 용어를 이 표기로 쓴다. 여기 없는 용어는 기존 조각의 다수 표기를 찾아 따르고, 새로 정했으면 이 표에 더한다. 괄호 안은 뜻이 갈리는 경우의 구분이다.

| 용어(en) | 뜻 | ja | zh | ar | es | fr | hi | id | pt |
|---|---|---|---|---|---|---|---|---|---|
| A / B | 대상 구분 표지 (차 A · 공 A · 점 A 등) | A / B | A / B | A / B | A · B | A / B | A / B | A / B | A / B |
| aberration | 수차 | 収差 | 像差 (色差·球差) | الزيغ | aberración | aberration | विपथन | aberasi | aberração |
| absolute zero | 절대 영도 | 絶対零度 | 绝对零度 | الصفر المطلق | cero absoluto | zéro absolu | परम शून्य | nol mutlak | zero absoluto |
| accelerates / accelerating / accelerated | 가속하다 (동사) | 加速する | 加速 | يتسارع / متسارع | acelerar / acelerado | accélérer / accéléré | त्वरित | dipercepat | acelerar / acelerado |
| acceleration | 가속도 | 加速度 | 加速度 | التسارع | aceleración | accélération | त्वरण | percepatan | aceleração |
| adiabatic | 단열 (과정) | 断熱 | 绝热 | أديباتي | adiabático | adiabatique | रुद्धोष्म | adiabatik | adiabático |
| alpha / beta / gamma | 알파 · 베타 · 감마 (방사선) | α / β / γ (アルファ・ベータ・ガンマ) | α · β · γ | ألفا · بيتا · غاما | alfa · beta · gamma (기호 α β γ 는 그대로) | alpha · bêta · gamma | अल्फ़ा · बीटा · गामा | alfa · beta · gamma | alfa · beta · gama (α · β · γ) |
| alternating current / AC | 교류 | 交流 | 交流电 | التيار المتردد | corriente alterna (CA) | courant alternatif / tension alternative | प्रत्यावर्ती धारा | arus bolak-balik (AC) | corrente alternada / CA (AC voltage 는 tensão alternada) |
| amplitude | 진폭 | 振幅 | 振幅 (probability amplitude 概率幅) | السعة | amplitud | amplitude | आयाम | amplitudo | amplitude |
| angle | 각 (각도) | 角 / 角度 | 角 / 角度 | زاوية | ángulo (right angle → ángulo recto / perpendicular) | angle | कोण | sudut | ângulo (at right angles → em ângulo reto / perpendicular) |
| angle of incidence / incidence | 입사각 | 入射角 (point of incidence → 入射点) | 入射角 (point of incidence 入射点) | زاوية السقوط | ángulo de incidencia | angle d’incidence | आपतन कोण | sudut datang (titik datang) | ângulo de incidência / incidência |
| angular acceleration | 각가속도 | 角加速度 | 角加速度 | التسارع الزاوي | aceleración angular | accélération angulaire | कोणीय त्वरण | percepatan sudut | aceleração angular |
| angular momentum | 각운동량 | 角運動量 | 角动量 | الزخم الزاوي | momento angular | moment cinétique | कोणीय संवेग | momentum sudut | momento angular |
| angular velocity / angular speed | 각속도 | 角速度 | 角速度 | السرعة الزاوية | velocidad angular (angular velocity) / rapidez angular (angular speed) | vitesse angulaire | कोणीय वेग | kecepatan sudut / kelajuan sudut | velocidade angular |
| antimatter / antiparticle / positron | 반물질 · 양전자 | 反物質 / 陽電子 | 反物质 / 正电子 | المادة المضادة · بوزيترون | antimateria · antipartícula · positrón | antimatière · antiparticule · positon | प्रतिद्रव्य / पॉज़िट्रॉन | antimateri · positron | antimatéria · antipartícula · pósitron |
| antinode | 배 | 腹 | 波腹 | البطن | antinodo | ventre | प्रस्पंद | perut | ventre |
| apparent brightness / brightness | 겉보기 밝기 | 見かけの明るさ (brightness → 明るさ) | 视亮度 (단독 brightness 는 亮度) | السطوع الظاهري | brillo aparente · brillo | éclat (apparent) | आभासी चमक (brightness 단독은 चमक) | kecerahan semu (brightness 단독은 kecerahan) | brilho aparente |
| apparent weight | 겉보기 무게 | 見かけの重さ | 视重 | الوزن الظاهري | peso aparente | poids apparent | आभासी भार | berat semu | peso aparente |
| area under | 그래프 아래 넓이 | 〜の下の面積 | …下方的面积 | المساحة تحت … | área bajo | aire sous … | के नीचे का क्षेत्रफल | luas di bawah … | área sob |
| atom / atoms | 원자 | 原子 | 原子 | ذرة | átomo | atome | परमाणु | atom | átomo |
| axis / axes | 축 (회전축·그래프축) | 軸 | 轴 — 렌즈 主光轴 · 자전 自转轴 · 회전 转轴 · 좌표 坐标轴 | محور | eje (eje óptico · semieje mayor) | axe / axes | अक्ष | sumbu | eixo |
| back EMF | 역기전력 | 逆起電力 | 反电动势 | القوة الدافعة الكهربائية العكسية | fuerza contraelectromotriz (fcem) | force contre-électromotrice (f.c.é.m.) | पश्च विद्युत वाहक बल | GGL balik | fem de retorno (força contraeletromotriz) |
| band / band gap / conduction band | 에너지 띠 · 띠 간격 | バンド / バンドギャップ / 伝導帯 / 価電子帯 | 能带 | نطاق | banda · banda prohibida · banda de conducción · banda de valencia | bande (d’énergie) · bande interdite · bande de conduction · bande de valence | बैंड | pita (celah pita, pita konduksi, pita valensi) | banda · banda proibida · banda de condução · banda de valência |
| band gap | 띠 간격 | バンドギャップ | 带隙 | فجوة النطاق | banda prohibida | bande interdite | बैंड अंतराल | celah pita | banda proibida |
| bar magnet | 막대자석 | 棒磁石 | 条形磁铁 | مغناطيس قضيبي | imán de barra | aimant droit | छड़ चुंबक | magnet batang | ímã em barra |
| beam / beams | 빛줄기 (광선 다발) | 光線 | 光线 / 光束 | حزمة | haz | faisceau | किरणपुंज | berkas | feixe |
| beat / beats | 맥놀이 | うなり | 拍 | الضربات | pulsaciones | battements | विस्पंद | pelayangan | batimento(s) |
| binding energy | 결합 에너지 | 結合エネルギー | 结合能 | طاقة الربط | energía de enlace | énergie de liaison | बंधन ऊर्जा | energi ikat | energia de ligação |
| black hole | 블랙홀 | ブラックホール | 黑洞 | ثقب أسود | agujero negro | trou noir | कृष्ण विवर | lubang hitam | buraco negro |
| blackbody | 흑체 | 黒体 | 黑体 | جسم أسود | cuerpo negro | corps noir | कृष्णिका | benda hitam | corpo negro |
| blue light / blue | 파랑 (빛) | 青い光 / 青 | 蓝光 | الأزرق | luz azul / azul | lumière bleue | नीला प्रकाश | cahaya biru | luz azul / azul |
| boils / boiling | 끓다 | 沸騰する | 沸腾 | يغلي / الغليان | hervir | bouillir | उबलना | mendidih | ferver |
| bulb / lamp | 전구 | 電球 | 灯泡 | مصباح | bombilla | ampoule | बल्ब | lampu | lâmpada |
| buoyancy / buoyant force | 부력 | 浮力 (centre of buoyancy → 浮心) | 浮力 (centre of buoyancy 浮心) | قوة الطفو | empuje | poussée d’Archimède (centre de poussée) | उत्प्लावन बल (centre of buoyancy = उत्प्लावन केंद्र) | gaya apung (centre of buoyancy = pusat apung) | empuxo |
| capacitor / capacitors | 축전기 | コンデンサー | 电容器 | مكثف | condensador | condensateur | संधारित्र | kapasitor | capacitor |
| cell | 전지 (한 칸) | 電池 | 电池 | خلية | pila | pile | सेल | sel | pilha |
| cell | 칸 (격자·표의 한 칸) | マス | 格 | خانة | casilla | case | खाना | sel / kotak | casa |
| cell | 세포 | 細胞 | 细胞 | خلية | célula | cellule | कोशिका | sel | célula |
| centre of buoyancy | 부심 | 浮心 | 浮心 | مركز الطفو | centro de empuje | centre de poussée | उत्प्लावन केंद्र | pusat apung | centro de empuxo |
| centre of gravity / center of gravity | 무게 중심 | 重心 | 重心 | مركز الثقل | centro de gravedad | centre de gravité | गुरुत्व केंद्र | titik berat | centro de gravidade |
| centre of mass / center of mass | 질량 중심 | 重心 | 质心 | مركز الكتلة | centro de masa | centre de masse | द्रव्यमान केंद्र | pusat massa | centro de massa |
| centripetal force / centripetal acceleration / centripetal | 구심(력·가속도) | 向心力 / 向心加速度 | 向心力 / 向心加速度 | المركزي / المركزية | centrípeta (fuerza/aceleración centrípeta) | centripète | अभिकेंद्र | sentripetal | centrípeta |
| charge / charges | 전하 | 電荷 | 电荷 | شحنة | carga | charge | आवेश | muatan | carga |
| charging / charged / charges up | 충전하다 · 대전된 | 帯電 (물체) / 充電 (축전기) | 带电 / 充电 / 起电 | الشحن / مشحون | cargado / carga (electrización para métodos de carga de un cuerpo) | charger / chargé(e) / charge (과정) | आवेशित / आवेशन | bermuatan / mengisi (pengisian) | carregado / carregando (주제 제목은 eletrização) |
| circuit / circuits | 회로 | 回路 | 电路 | دائرة | circuito | circuit | परिपथ | rangkaian | circuito |
| circular motion | 원운동 | 円運動 | 圆周运动 | الحركة الدائرية | movimiento circular | mouvement circulaire | वृत्तीय गति | gerak melingkar | movimento circular |
| coil / coils | 코일 | コイル | 线圈 | ملف | bobina | bobine | कुंडली | kumparan | bobina |
| collision / collisions / collides | 충돌 | 衝突 | 碰撞 | التصادم | choque (chocar) | collision | टक्कर | tumbukan | colisão |
| component | 성분 (벡터 성분) | 成分 | 矢量的分量 | مركّبة | componente (여성형 la componente) | composante | घटक | komponen | componente (a componente) |
| concave | 오목 | 凹 (凹面鏡・凹レンズ). 수면 모양은 「へこんだ」 | 凹 (凹透镜·凹面镜·凹液面) | مقعر | cóncavo | concave | अवतल | cekung | côncavo/côncava |
| concave lens / diverging lens | 오목 렌즈 (퍼뜨리는 렌즈) | 凹レンズ (diverging lens 도 凹レンズ) | 凹透镜 (diverging lens 도 凹透镜) | عدسة مقعرة (concave) · عدسة مفرقة (diverging) | lente cóncava / lente divergente | lentille concave (en concave) / lentille divergente (en diverging) | अवतल लेंस (en concave) / अपसारी लेंस (en diverging) | lensa cekung (en concave) · lensa divergen (en diverging) | lente côncava (en concave) / lente divergente (en diverging) |
| conduction / conducts | 전도 (열·전기) | 伝導 (熱伝導 · 伝導帯 · 導体) | 传导 (热传导 · 导体 · 导带) | التوصيل | conducción / conductor | conduction / conducteur | चालन (conducting = चालक) | konduksi (conducting = konduktor) | condução / condutor |
| conductor | 도체 | 導体 | 导体 | موصل | conductor | conducteur | चालक | konduktor | condutor |
| conservation / conserved | 보존 (법칙) | 保存 | 守恒 | حفظ | conservación (conservarse) | conservation | संरक्षण | kekekalan (kekal) | conservação / conservar-se |
| conservative force / non-conservative force | 보존력 / 비보존력 | 保存力 / 非保存力 | 保守力 / 非保守力 | القوة المحافظة / القوة غير المحافظة | fuerza conservativa / fuerza no conservativa | force conservative / non conservative | संरक्षी / असंरक्षी बल | gaya konservatif / gaya nonkonservatif | força conservativa / força não conservativa |
| converging / converges | 모으는 (수렴) | 凸レンズ(렌즈) / 集まる(광선) | 凸透镜 (렌즈) / 会聚 (광선) | مجمعة | convergente | convergent(e) | अभिसारी | konvergen (lensa) · mengumpul (berkas) | convergente |
| convex | 볼록 | 凸 (凸面鏡・凸レンズ). 수면 모양은 「盛り上がった」 | 凸 (凸透镜·凸面镜·凸起) | محدب | convexo | convexe | उत्तल | cembung | convexo/convexa |
| convex lens / converging lens | 볼록 렌즈 (모으는 렌즈) | 凸レンズ (converging lens 도 凸レンズ) | 凸透镜 (converging lens 도 凸透镜) | عدسة محدبة (convex) · عدسة مجمعة (converging) | lente convexa / lente convergente | lentille convexe (en convex) / lentille convergente (en converging) | उत्तल लेंस (en convex) / अभिसारी लेंस (en converging) | lensa cembung (en convex) · lensa konvergen (en converging) | lente convexa (en convex) / lente convergente (en converging) |
| cooling / cooled / cools | 냉각하다 (식히다) | 冷却(명사·라벨) / 冷やす・冷える(동사문) | 冷却 | التبريد / يبرد | enfriar(se) / enfriamiento | refroidir / refroidissement | ठंडा करना/होना / शीतलन(명사) | mendinginkan / didinginkan / pendinginan / mendingin | resfriar / resfriamento (자동사 cools 는 esfriar) |
| crest | 마루 | 山 | 波峰 (지형의 crest 는 峰顶) | القمة | cresta | crête | शिखर | puncak | crista |
| critical angle | 임계각 | 臨界角 | 临界角 | الزاوية الحرجة | ángulo crítico | angle critique | क्रांतिक कोण | sudut kritis | ângulo crítico |
| critical temperature | 임계 온도 | 臨界温度 | 临界温度 | درجة الحرارة الحرجة | temperatura crítica | température critique | क्रांतिक ताप | suhu kritis | temperatura crítica |
| Cross-section / cross-section | 단면 | 断面 (넓이 뜻이면 断面積) | 截面 (넓이는 横截面积) | مقطع عرضي | Sección transversal | Coupe (그림 단면) · section (도체·관의 단면적) | अनुप्रस्थ काट | Penampang | corte transversal (보기 이름) / seção transversal (넓이·단면을 지나는 면) |
| current | 물살 (물의 흐름) | 流れ | 水流 | تيار | corriente | courant | धारा | arus | corrente |
| current / currents / electric current | 전류 | 電流 | 电流 | التيار | corriente | courant | धारा | arus (listrik) | corrente (elétrica) |
| current flows | 전류가 흐르다 | 電流が流れる | 电流流过 / 有电流 | يسري التيار / يمر التيار | circula corriente | le courant circule / passe | धारा बहती है | arus mengalir | a corrente passa / flui |
| cylinder | 실린더 (기체 용기) | シリンダー | 气缸 | أسطوانة | cilindro | cylindre | सिलिंडर | silinder | cilindro |
| damped / damping | 감쇠 | 減衰 (under/critically/over → 不足減衰・臨界減衰・過減衰) | 阻尼 | التخميد / مُخمَّد | amortiguamiento / amortiguado | amortissement / amorti(e) | अवमंदन / अवमंदित | redaman / teredam (teredam kurang · kritis · lebih) | amortecimento / amortecido |
| decay / decays | 붕괴 (방사성) | 崩壊 | 衰变 | اضمحلال | desintegración (radiactiva) | désintégration · décroissance (exponentielle) | क्षय | peluruhan / meluruh | decaimento |
| Default | stage·view 기본 이름 | 標準 | 默认 | افتراضي | Predeterminada | Par défaut | डिफ़ॉल्ट | Bawaan | Padrão |
| density | 밀도 | 密度 | 密度 | الكثافة | densidad | 질량 밀도 masse volumique · 수 밀도·확률 밀도 densité | घनत्व | massa jenis | densidade |
| dielectric | 유전체 | 誘電体 | 电介质 | العازل الكهربائي (되받을 때 العازل) | dieléctrico | diélectrique | परावैद्युत | dielektrik | dielétrico |
| diffraction / diffracts | 회절 | 回折 | 衍射 | الحيود | difracción | diffraction | विवर्तन | difraksi | difração |
| diode / LED | 다이오드 · LED | ダイオード / LED | 二极管 / LED | صمام ثنائي · LED 는 라틴 표기 유지 | diodo · LED | diode · LED | डायोड / LED | dioda · LED | diodo · LED |
| dispersion / disperses | 분산 (빛의) | 分散 | 色散 | تفريق الضوء | dispersión | dispersion | वर्ण-विक्षेपण | dispersi | dispersão |
| displacement | 변위 | 変位 | 位移 | الإزاحة | desplazamiento | déplacement | विस्थापन | perpindahan / simpangan | deslocamento |
| diverging / diverges | 퍼뜨리는 (발산) | 凹レンズ(렌즈) / 発散(수학적 발산) | 凹透镜 (렌즈) / 发散 (광선·양) | مفرقة | divergente | divergent(e) / diverger | अपसारी | divergen (lensa) · menyebar (berkas) | divergente / divergir |
| Doppler effect | 도플러 효과 | ドップラー効果 | 多普勒效应 | تأثير دوبلر | efecto Doppler | effet Doppler | डॉप्लर प्रभाव | efek Doppler | efeito Doppler |
| double slit | 이중 슬릿 | 二重スリット | 双缝 | الشق المزدوج | doble rendija | double fente (Young: fentes de Young) | द्वि-झिरी | celah ganda | fenda dupla |
| drag / drag force / air drag | 항력 (유체 저항) | 抗力 (air drag → 空気抵抗) | 阻力 (공기 저항은 空气阻力) | قوة السحب | arrastre | traînée (유체 항력) · résistance de l’air (공기 저항) | कर्षण | gaya hambat | arrasto (air drag → resistência do ar) |
| driven / driving frequency | 강제 진동 (구동) | 強制振動 / 駆動振動数 | 受迫振动 (driving frequency 驱动频率) | قسري | forzado / de excitación | forcé(e) · fréquence d’excitation | प्रणोदित दोलन / चालक आवृत्ति | osilasi paksa · frekuensi penggerak | forçada (oscilação forçada) · frequência de excitação |
| E | 방위 동 | 東 | 东 | شرق | E | E | पूर्व | T | L |
| Earth | 지구 | 地球 | 地球 | الأرض | Tierra | Terre | पृथ्वी | Bumi | Terra |
| Earth and Moon / Sun and Earth | 천체 쌍 view 이름 | 地球と月 / 太陽と地球 | 地球与月球 / 太阳与地球 | الأرض والقمر · الشمس والأرض | La Tierra y la Luna · El Sol y la Tierra | La Terre et la Lune / Le Soleil et la Terre | पृथ्वी और चंद्रमा / सूर्य और पृथ्वी | Bumi dan Bulan | A Terra e a Lua / O Sol e a Terra |
| eccentricity | 이심률 | 離心率 | 离心率 | الاختلاف المركزي | excentricidad | excentricité | उत्केंद्रता | eksentrisitas | excentricidade |
| eclipse | 식 (일식·월식) | 食 (日食 / 月食) | 食 (日食·月食) | الكسوف / الخسوف | eclipse | éclipse | ग्रहण | gerhana | eclipse |
| eddy current | 맴돌이 전류 | 渦電流 | 涡流 | التيارات الدوامية | corrientes de Foucault | courants de Foucault | भँवर धारा | arus pusar | correntes de Foucault |
| efficiency | 효율 | 効率 | 效率 | الكفاءة | eficiencia | rendement | दक्षता | efisiensi | eficiência |
| elastic collision / elastic | 탄성 (충돌) | 弾性衝突 | 弹性碰撞 | التصادم المرن | choque elástico / elástico | élastique | प्रत्यास्थ टक्कर | lenting sempurna | colisão elástica / elástica |
| electric | 전기의 | 電気の / 電場 | 电 (电场·电场力·电能) | كهربائي | eléctrico/a | électrique | विद्युत | listrik | elétrico(a) |
| electric field / E field | 전기장 | 電場 | 电场 | المجال الكهربائي | campo eléctrico | champ électrique | विद्युत क्षेत्र | medan listrik | campo elétrico |
| electric field lines / E lines | 전기력선 | 電気力線 | 电场线 (E lines → E 线) | خطوط المجال الكهربائي (E lines 는 خطوط E) | líneas de campo eléctrico / líneas E | lignes de champ électrique / lignes E | विद्युत क्षेत्र रेखाएँ (E रेखाएँ) | garis medan listrik (garis E) | linhas de campo elétrico / linhas E |
| electric force | 전기력 | 電気力 | 电场力 | القوة الكهربائية | fuerza eléctrica | force électrique | विद्युत बल | gaya listrik | força elétrica |
| electromagnetic | 전자기의 | 電磁 | 电磁 | كهرومغناطيسي | electromagnético/a | électromagnétique | विद्युत चुंबकीय | elektromagnetik | eletromagnético(a) |
| electromagnetic wave | 전자기파 | 電磁波 | 电磁波 | موجة كهرومغناطيسية | onda electromagnética | onde électromagnétique | विद्युत चुंबकीय तरंग | gelombang elektromagnetik | onda eletromagnética |
| electron / electrons | 전자 | 電子 | 电子 | إلكترون | electrón | électron | इलेक्ट्रॉन | elektron | elétron |
| ellipse / elliptical | 타원 | 楕円 | 椭圆 | قطع ناقص (형용사 elliptical 은 إهليلجي) | elipse · elíptica | ellipse / elliptique | दीर्घवृत्त / दीर्घवृत्ताकार | elips | elipse / elíptica |
| EMF / emf / ε | 기전력 | 起電力 | 电动势 | القوة الدافعة الكهربائية | fem | f.é.m. (force électromotrice) | विद्युत वाहक बल | GGL | fem |
| emits / absorbs / emission | 방출 · 흡수 | 放出 / 吸収 | 发射 / 吸收 | انبعاث · امتصاص | emisión · absorción (emitir · absorber) | émission · absorption (émettre · absorber) | उत्सर्जन / अवशोषण·अवशोषित | emisi / pancaran (memancarkan) · serapan (menyerap) | emissão · absorção (emitir · absorver) |
| energy / energies | 에너지 (일반) | エネルギー | 能量 | الطاقة | energía | énergie | ऊर्जा | energi | energia |
| energy level / level / levels | 에너지 준위 | エネルギー準位 / 準位 | 能级 | مستوى | nivel de energía · nivel | niveau (d’énergie) | ऊर्जा स्तर / स्तर | tingkat energi | nível de energia |
| entropy | 엔트로피 | エントロピー | 熵 | الإنتروبيا | entropía | entropie | एन्ट्रॉपी | entropi | entropia |
| equilibrium | 평형 | 平衡 | 平衡 | الاتزان | equilibrio | équilibre | संतुलन | kesetimbangan | equilíbrio |
| equipotential | 등전위 | 等電位 | 等势 | تساوي الجهد | equipotencial | équipotentiel(le) | समविभव | ekuipotensial | equipotencial |
| escape velocity / escape speed | 탈출 속도 | 脱出速度 | 逃逸速度 | سرعة الإفلات | velocidad de escape | vitesse de libération | पलायन वेग | kecepatan lepas | velocidade de escape |
| event horizon / horizon | 사건의 지평선 | 事象の地平線 | 事件视界 | أفق الحدث | horizonte de sucesos | horizon (des événements) | घटना क्षितिज | horizon peristiwa | horizonte de eventos |
| excited state / excited level | 들뜬 상태 | 励起状態 / 励起原子 | 激发态 | مثار | nivel excitado · átomo excitado | état excité · niveau excité · atome excité | उत्तेजित स्तर / उत्तेजित | tingkat tereksitasi / atom tereksitasi | estado excitado · nível excitado |
| expanding universe / expansion | 우주 팽창 | 膨張する宇宙 / 宇宙の膨張 | 宇宙膨胀 | الكون المتمدد | expansión del universo | expansion de l’Univers | प्रसारी ब्रह्मांड | pengembangan alam semesta | expansão do universo |
| expands / expansion | 팽창하다 | 膨張する | 膨胀 | يتمدد / التمدد | expandirse / expansión | se dilater / détente (기체) | फैलना / प्रसार | memuai (pemuaian) | expandir / expansão |
| eyepiece | 접안렌즈 | 接眼レンズ | 目镜 | العدسة العينية (막대 라벨은 العينية) | ocular | oculaire | नेत्रिका | lensa okuler (label batang: okuler) | ocular |
| Fermi level | 페르미 준위 | フェルミ準位 | 费米能级 | مستوى فيرمي | nivel de Fermi | niveau de Fermi | फर्मी स्तर | tingkat Fermi | nível de Fermi |
| field / fields | 장 (물리의 장 일반) | 場 | 场 | المجال | campo | champ | क्षेत्र | medan | campo |
| field lines | 장의 선 (전기력선·자기력선) | 電気力線 (전기장) / 磁力線 (자기장) | 电场线 / 磁感线 | خطوط المجال | líneas de campo | lignes de champ | क्षेत्र रेखाएँ | garis medan | linhas de campo |
| fission | 핵분열 | 核分裂 | 裂变 / 核裂变 | انشطار | fisión | fission | विखंडन | fisi (fisi nuklir) | fissão |
| flow speed | 흐름 속력 (유속) | 流速 | 流速 | سرعة التدفق | rapidez del flujo | vitesse d’écoulement | प्रवाह की चाल | kelajuan aliran | velocidade do escoamento |
| fluid / fluids | 유체 | 流体 | 流体 | مائع | fluido | fluide | तरल | fluida | fluido |
| flux | 선속 (자기 선속) | 磁束 (자기) / 電束 (전기) | 磁通量 / 电通量 | التدفق | flujo | flux | फ्लक्स | fluks | fluxo |
| focal length | 초점 거리 | 焦点距離 | 焦距 | البعد البؤري | distancia focal | distance focale | फोकस दूरी | jarak fokus | distância focal |
| focal point / focus | 초점 (광학) | 焦点 | 焦点 | البؤرة | foco | foyer | फोकस | titik fokus | foco |
| focus / foci / empty focus | 타원의 초점 | 焦点 | 焦点 (空焦点) | البؤرة | foco (foco vacío) | foyer | नाभि | fokus (fokus kosong) | foco (foco vazio) |
| force / forces | 힘 (일반) | 力 | 力 | قوة | fuerza | force | बल | gaya | força |
| fourth power / power of ten | 거듭제곱 (수학) | 〜乗 / 10のべき乗 | ……次方 / 10的幂 (10의 거듭제곱 한 단계는 数量级) | القوة (الرابعة) · قوى العشرة | potencia (cuarta potencia · potencias de diez) | puissance quatrième · puissances de dix | घात | pangkat (pangkat empat · pangkat sepuluh) | potência (quarta potência · potências de dez) |
| frame / reference frame | 기준틀 (상대성·운동 기술의 틀). 정지 틀(rest frame)은 규칙 표 | 座標系 | 参考系 | الإطار المرجعي | sistema de referencia | référentiel | निर्देश तंत्र | kerangka acuan | referencial |
| frame | 화면의 틀 (그림 한 장) | 枠 | 画框 | الإطار | marco | cadre | फ्रेम | bingkai | quadro |
| free fall | 자유 낙하 | 自由落下 | 自由落体 | السقوط الحر | caída libre | chute libre | मुक्त पतन | jatuh bebas | queda livre |
| frequency | 진동수 | 振動数 (교류 회로 문맥은 周波数) | 频率 (threshold frequency 截止频率) | التردد | frecuencia | fréquence | आवृत्ति (driving frequency = चालक आवृत्ति) | frekuensi | frequência |
| friction / frictional | 마찰(력) | 摩擦 | 摩擦力 (힘) / 摩擦 (현상) | الاحتكاك | rozamiento | frottement | घर्षण | gesekan | atrito |
| frictionless | 마찰 없는 | 摩擦のない | 无摩擦的 | عديم الاحتكاك | sin rozamiento | sans frottement | घर्षणरहित | tanpa gesekan | sem atrito |
| From above the North Pole | 북극 위에서 본 모습 | 北極の上から | 从北极上方看 | من فوق القطب الشمالي | Desde encima del Polo Norte | Vu au-dessus du pôle Nord | उत्तरी ध्रुव के ऊपर से | Dari atas Kutub Utara | Visto de cima do Polo Norte |
| From the ground / Ground frame | 땅에서 본 모습 | 地上から | 从地面看 | من الأرض | Desde el suelo · Sistema de referencia del suelo (Ground frame) | Depuis le sol (view 이름) · vu du sol (문장) | धरती से (라벨) · ज़मीन से देखने पर (문장) | Dari permukaan tanah (라벨) / dari tanah (문장) | do chão |
| fusion | 핵융합 | 核融合 | 聚变 / 核聚变 | اندماج | fusión | fusion | संलयन | fusi (fusi nuklir) | fusão |
| galvanometer | 검류계 | 検流計 | 检流计 | الجلفانومتر | galvanómetro | galvanomètre | गैल्वेनोमीटर | galvanometer | galvanômetro |
| gas / gases | 기체 | 気体 | 气体 | غاز | gas | gaz | गैस | gas | gás |
| generator | 발전기 | 発電機 | 发电机 | مولد | generador | générateur | जनित्र (label 은 विद्युत जनित्र) | generator | gerador |
| gravitational potential energy | 중력 퍼텐셜 에너지 | 重力による位置エネルギー | 重力势能 (지표 근처) / 引力势能 (일반·무한원 기준) | طاقة الوضع الجاذبية | energía potencial gravitatoria | énergie potentielle de pesanteur (지표) / gravitationnelle (천체·일반) | गुरुत्वीय स्थितिज ऊर्जा | energi potensial gravitasi | energia potencial gravitacional |
| gravity | 중력 (지표의 무게를 만드는 g) | 重力 | 重力 | الجاذبية | gravedad | pesanteur | गुरुत्व | gravitasi | gravidade |
| gravity / gravitational pull | 천체 사이 끌림 (인력) | 引力 (또는 重力) | 引力 | الجاذبية | gravedad / atracción gravitatoria | gravité | गुरुत्व / गुरुत्वाकर्षण | gravitasi (gaya tarik gravitasi) | gravidade / atração gravitacional |
| ground state | 바닥 상태 | 基底状態 (en 이 lowest level 이면 最も低い準位) | 基态 (lowest level → 最低能级) | أدنى مستوى | estado fundamental (en 이 lowest level 이면 nivel más bajo) | état fondamental (en 이 lowest level 이면 niveau le plus bas) | सबसे निचला स्तर | keadaan dasar (en 이 lowest level 이면 tingkat terendah) | estado fundamental |
| half-life | 반감기 | 半減期 | 半衰期 | عمر النصف | semivida | demi-vie | अर्ध-आयु | waktu paruh | meia-vida |
| harmonic / harmonics | 배음 (조화) | 倍音 (harmonics) / 調和 (harmonic well) | 谐波 (harmonic well 谐振子势阱) | توافقي / التوافقيات | armónico | harmonique | संनादी | harmonik | harmônico |
| heat | 열 (에너지로서) | 熱 | 热 / 热量 (문법에 따라, 같은 것으로 봄) | الحرارة | calor | chaleur (heat bath → bain thermostaté, specific heat → capacité thermique massique) | ऊष्मा | kalor | calor |
| heating / heated / heats | 가열하다 | 加熱(명사·라벨) / 温める・熱くなる(동사문) | 加热 (heats up 变热·升温) | التسخين / يسخن | calentar(se) / calentamiento | chauffer / chauffage (자동사 chauffer · se réchauffer) | गर्म करना / तापन(명사) | memanaskan / dipanaskan / pemanasan / memanas | aquecer / aquecimento (자동사 heats up 은 esquentar) |
| hole / holes | 양공 (반도체) | 正孔 | 空穴 | ثقب | hueco | trou | कोटर | lubang | lacuna |
| horizon | 지평선 | 地平線 | 地平线 | الأفق | horizonte | horizon | क्षितिज | cakrawala | horizonte |
| HR diagram | HR 도 | HR図 | 赫罗图 | مخطط HR | diagrama HR | diagramme HR | HR आरेख | Diagram HR | diagrama HR |
| image / images | 상 (광학) | 像 | 像 | صورة | imagen | image | प्रतिबिंब | bayangan | imagem |
| image distance / object distance | 상 거리 · 물체 거리 | 像距離 / 物体距離 | 像距 · 物距 | بعد الصورة · بعد الجسم | distancia de la imagen / distancia del objeto | distance de l’image / distance de l’objet | प्रतिबिंब दूरी / वस्तु दूरी | jarak bayangan · jarak benda | distância da imagem / distância do objeto |
| impulse | 충격량 | 力積 | 冲量 | الدفع | impulso | impulsion | आवेग | impuls | impulso |
| induction / induced / induces | 유도 (전자기) | 誘導 | 感应 | الحث / مستحث | inducción / inducido / inducir | influence (정전기) · induit(e) (전자기) | प्रेरण / प्रेरित | induksi (terinduksi, arus induksi) | indução · induzido/induzir |
| inductor / inductance | 인덕터 · 인덕턴스 | コイル / インダクタンス | 电感器 / 电感 | محث / المحاثة | inductor / inductancia | bobine (소자) · inductance (물리량) | प्रेरक / प्रेरकत्व | induktor / induktansi | indutor · indutância |
| inelastic / perfectly inelastic | 비탄성 (충돌) | 非弾性衝突 / 完全非弾性衝突 | 非弹性碰撞 / 完全非弹性碰撞 | غير مرن / غير مرن تمامًا | inelástico / perfectamente inelástico | inélastique / parfaitement inélastique | अप्रत्यास्थ / पूर्णतः अप्रत्यास्थ टक्कर | lenting sebagian / tidak lenting sama sekali | inelástica / perfeitamente inelástica |
| inertia | 관성 | 慣性 | 惯性 | القصور الذاتي | inercia | inertie | जड़त्व | inersia | inércia |
| inertial frame / non-inertial frame | 관성 기준틀 / 비관성 기준틀 | 慣性系 / 非慣性系 | 惯性参考系 / 非惯性参考系 | الإطار المرجعي القصوري / غير القصوري | sistema de referencia inercial / no inercial | référentiel inertiel / non inertiel | जड़त्वीय / अजड़त्वीय निर्देश तंत्र | kerangka acuan inersial / non-inersial | referencial inercial / referencial não inercial |
| infrared / IR | 적외선 | 赤外線 | 红外线 | الأشعة تحت الحمراء (짧은 라벨 تحت الحمراء) | infrarrojo (IR) | infrarouge (IR) | अवरक्त | inframerah | infravermelho (약자 IV) |
| insulation / insulator | 단열재 · 절연체 | 断熱材(열) / 絶縁体(전기) / 断熱(개념 제목) | 隔热 (단열재 绝热材料 · 전기 절연체 绝缘体) | عازل (حراري) / العزل الحراري | aislante (재료·절연체) / aislamiento (개념) | isolant (물질·절연체) · isolation thermique (주제) | ऊष्मारोधन·ऊष्मारोधी(열) / विद्युतरोधी(전기) | isolator (insulation 주제명은 Insulasi termal) | isolante (재료·절연체) / isolamento térmico (주제명) |
| intensity | 세기 (빛·소리) | 強さ | 强度 (sound intensity 声强) | الشدة | intensidad | intensité | तीव्रता | intensitas | intensidade |
| interference / interferes | 간섭 | 干渉 | 干涉 | التداخل | interferencia | interférences | व्यतिकरण | interferensi | interferência |
| ion / ions | 이온 | イオン | 离子 | أيون | ion | ion | आयन | ion | íon |
| isobaric / constant pressure | 등압 | 定圧(과정 이름) / 圧力一定(서술) | 等压 (constant pressure 压强不变) | متساوي الضغط / عند ضغط ثابت | isobárico / a presión constante | isobare · à pression constante (en fixed pressure 는 pression fixe) | समदाबी (constant pressure = स्थिर दाब) | isobarik (constant pressure = tekanan tetap) | isobárico / a pressão constante |
| isochoric / fixed volume | 등적 | 定積(과정 이름) / 体積一定(서술) | 等容 (fixed volume 体积不变) | متساوي الحجم / عند حجم ثابت | isocórico / a volumen fijo | isochore · à volume fixe | समआयतनी (fixed volume = स्थिर आयतन) | isokhorik (fixed volume = volume tetap) | isocórico / a volume fixo |
| isothermal | 등온 | 等温 | 等温 | متساوي الحرارة / تساوي الحرارة | isotérmico | isotherme | समतापी | isotermal | isotérmico |
| junction | 접합 (p–n) · 분기점 | 接合 (p–n) / 分岐点 (회로) | 结 (p–n 结) / 节点 (회로 분기점) | وصلة (p–n) · عقدة (회로 분기점) | unión (p–n 접합) · nudo (회로 분기점) | jonction (p–n) · nœud (회로 분기점) | संधि | sambungan (p–n) · titik cabang (회로 분기점) | junção (p–n) · nó (circuito) |
| Kepler's law / first law / second law | 케플러 법칙 | ケプラーの第n法則 | 开普勒第一/第二/第三定律 | قانون كبلر | ley de Kepler (primera/segunda/tercera) | loi de Kepler | केप्लर का … नियम | Hukum Pertama/Kedua/Ketiga Kepler | lei de Kepler (primeira/segunda/terceira) |
| kinetic energy / kinetic | 운동 에너지 | 運動エネルギー | 动能 | الطاقة الحركية | energía cinética / cinética | énergie cinétique | गतिज ऊर्जा | energi kinetik | energia cinética |
| Lagrange point | 라그랑주 점 | ラグランジュ点 | 拉格朗日点 | نقاط لاغرانج | punto de Lagrange | point de Lagrange | लाग्रांज बिंदु | titik Lagrange | ponto de Lagrange |
| laminar | 층흐름 | 層流 | 层流 | الطبقي | laminar | laminaire | स्तरीय | laminar | laminar (escoamento laminar) |
| laser / stimulated emission | 레이저 · 유도 방출 | レーザー / 誘導放出 | 激光 / 受激辐射 | ليزر · الانبعاث المحفَّز | láser · emisión estimulada | laser · émission stimulée | लेज़र / उद्दीपित उत्सर्जन | laser · emisi terstimulasi | laser · emissão estimulada |
| latitude | 위도 | 緯度 (北緯 {lat}°) | 纬度 | خط العرض | latitud | latitude | अक्षांश | lintang (… ° LU) | latitude |
| lens / lenses | 렌즈 (광학) | レンズ | 透镜 | عدسة | lente (femenino) | lentille | लेंस | lensa | lente |
| lens / lens of the eye | 수정체 (눈) | 水晶体 | 晶状体 | عدسة العين | cristalino | cristallin | नेत्र लेंस | lensa mata | cristalino |
| level / stays level | 수평 (기울지 않음) | 水平 (기울기) / 同じ高さ (막대 높이 맞춤) | 水平 / 齐平 | أفقي (…와 같은 높이면 بارتفاع/بمستوى) | horizontal · nivelado · a la altura de | horizontal(e) · au niveau de | क्षैतिज (기울기) · बराबर (높이 맞춤) | mendatar (막대·면) · sama tinggi (막대끼리 높이) · sejajar (액면) | horizontal / nivelado(a); level with → na (mesma) altura de / no nível de |
| light | 빛 | 光 | 光 | الضوء | luz | lumière | प्रकाश | cahaya | luz |
| light / lighter | 가벼운 (무게) | 軽い | 轻 | خفيف / أخف | ligero | léger / légère | हल्का | ringan | leve / mais leve |
| lights up / light up | 불이 켜지다 | 点く | 亮起 | يضيء | encenderse | s’allumer | जलना (बल्ब जलता है) | menyala | acender |
| liquid | 액체 | 液体 | 液体 (상태 형용은 液态) | سائل | líquido | liquide | द्रव | cairan (상태 형용사 cair) | líquido |
| luminosity | 광도 (별이 내는 전체 빛) | 光度 | 光度 | الضياء | luminosidad | luminosité | दीप्ति | luminositas | luminosidade |
| lunar eclipse | 월식 | 月食 | 月食 | خسوف القمر | eclipse lunar | éclipse de Lune | चंद्र ग्रहण | gerhana Bulan | eclipse lunar |
| magnet / magnets | 자석 | 磁石 | 磁铁 | مغناطيس (복수 مغانط) | imán | aimant | चुंबक | magnet | ímã |
| magnetic | 자기의 | 磁気の / 磁場 | 磁 (磁场·磁场力·磁能) | مغناطيسي | magnético/a | magnétique | चुंबकीय | magnet (medan/gaya magnet) · magnetik (dipol/bahan magnetik) | magnético(a) |
| magnetic field | 자기장 | 磁場 | 磁场 | المجال المغناطيسي | campo magnético | champ magnétique | चुंबकीय क्षेत्र | medan magnet | campo magnético |
| magnetic force | 자기력 | 磁気力 | 磁场力 | القوة المغناطيسية | fuerza magnética | force magnétique | चुंबकीय बल | gaya magnet | força magnética |
| magnification / magnifies | 배율 (확대) | 倍率 | 放大率 | التكبير | aumento | grossissement | आवर्धन | perbesaran | ampliação |
| magnitude | 등급 (별의 밝기) | 等級 | 星等 | القدر | magnitud | magnitude | कांतिमान | magnitudo | magnitude |
| main sequence | 주계열 | 主系列 | 主序 | النسق الأساسي | secuencia principal | séquence principale | मुख्य अनुक्रम | deret utama | sequência principal |
| mass / masses | 질량 (물리량) | 質量 | 质量 | الكتلة | masa | masse | द्रव्यमान | massa | massa |
| mass | 추 (매단 물체) | おもり | 物块 (质量块) | ثقالة | masa · pesa (매단 물체) | masse | पिंड | beban | massa |
| mechanical energy | 역학적 에너지 | 力学的エネルギー | 机械能 | الطاقة الميكانيكية | energía mecánica | énergie mécanique | यांत्रिक ऊर्जा | energi mekanik | energia mecânica |
| medium | 매질 | 媒質 | 介质 | الوسط | medio | milieu | माध्यम | medium | meio |
| melts / melting | 녹다 (융해) | 融ける | 熔化 (눈·얼음은 融化) | ينصهر / الانصهار | fundirse / fundido | fondre | पिघलना | mencair | derreter |
| mirror / mirrors | 거울 | 鏡 (plane mirror → 平面鏡, partial mirror → 部分透過鏡) | 镜 (镜子·镜面; 레이저 반사경은 反射镜) | مرآة | espejo | miroir | दर्पण | cermin | espelho |
| molecule / molecules | 분자 | 分子 | 分子 | جزيء / الجزيئات | molécula | molécule | अणु | molekul | molécula |
| moment | 순간 (시각) | 瞬間 | 瞬间 / 时刻 | لحظة | instante | instant | क्षण | saat / begitu … | instante |
| moment of inertia | 관성 모멘트 | 慣性モーメント | 转动惯量 | عزم القصور الذاتي | momento de inercia | moment d’inertie | जड़त्व आघूर्ण | momen inersia | momento de inércia |
| momentum | 운동량 | 運動量 | 动量 | الزخم | momento lineal | quantité de mouvement | संवेग | momentum | quantidade de movimento |
| Moon | 달 | 月 | 月球 (소문자 moon 은 卫星, new/full moon 은 新月·满月, 조각 이름은 月相) | القمر | Luna | Lune | चंद्रमा | Bulan | Lua |
| N | 방위 북 | 北 | 北 | شمال | N | N | उत्तर | U | N |
| natural frequency | 고유 진동수 | 固有振動数 | 固有频率 | التردد الطبيعي | frecuencia natural | fréquence propre | प्राकृतिक आवृत्ति | frekuensi alami | frequência natural |
| net force | 알짜힘 | 合力 | 合力 | محصلة القوى | fuerza neta | force résultante | परिणामी बल | gaya total | força resultante |
| neutral | 중성 | 中性 (전하) / 中立 (평형) | 中性 | متعادل | neutro (carga) · indiferente (equilibrio) | neutre (전하) / indifférent (평형) | उदासीन | netral | neutro (전하) · indiferente (평형) |
| neutron / neutrons | 중성자 | 中性子 | 中子 | نيوترون | neutrón | neutron | न्यूट्रॉन | neutron | nêutron |
| neutron star | 중성자별 | 中性子星 | 中子星 | نجم نيوتروني | estrella de neutrones | étoile à neutrons | न्यूट्रॉन तारा | bintang neutron | estrela de nêutrons |
| node / nodes | 마디 | 節 | 波节 | العقدة | nodo | nœud | निस्पंद | simpul | nó |
| noise | 소음 (상쇄) | 騒音 (음향) / 雑音 (신호) | 噪声 (active noise cancellation 主动降噪) | الضوضاء | ruido | bruit (réduction active du bruit) | शोर | bising (akustik) · derau (sinyal) | ruído |
| normal | 법선 | 法線 | 法线 | العمود | normal | normale | अभिलंब | garis normal | normal |
| normal force | 수직항력 | 垂直抗力 | 支持力 | القوة العمودية | fuerza normal | force normale | अभिलंब बल | gaya normal | força normal |
| North Pole | 북극 (지리) | 北極 | 北极 | القطب الشمالي | Polo Norte | pôle Nord · 보기 이름 Vu au-dessus du pôle Nord | उत्तरी ध्रुव | Kutub Utara | Polo Norte |
| nucleon | 핵자 | 核子 | 核子 (per nucleon → 比结合能) | نيوكليون | nucleón | nucléon | न्यूक्लिऑन | nukleon | núcleon |
| nucleus / nuclei | 원자핵 | 原子核 | 原子核 (문맥상 核) | نواة / نوى | núcleo | noyau | नाभिक | inti / inti atom | núcleo |
| object / object distance | 물체 (광학의 물체) | 物体 / 物体距離 | 物体 (object distance 物距) | الجسم | objeto | objet | वस्तु | benda | objeto |
| objective | 대물렌즈 | 対物レンズ | 物镜 | العدسة الشيئية (막대 라벨은 الشيئية) | objetivo | objectif | अभिदृश्यक | lensa objektif (label batang: objektif) | objetiva |
| optical axis | 광축 | 光軸 | 主光轴 / 光轴 | المحور البصري | eje óptico | axe optique | प्रकाशिक अक्ष | sumbu optik | eixo óptico |
| orbit / orbits / orbital | 궤도 · 공전하다 | 軌道 (공전 운동은 公転) | 轨道 (명사) / 公转·绕行 (동사) | المدار | órbita (orbitar) · orbital | orbite · orbiter · orbital | कक्षा (공전·한 바퀴는 परिक्रमा) | orbit (mengorbit) | órbita / orbitar |
| oscillation / oscillates | 진동 (왕복 운동) | 振動 | 振动 (LC 전기 진동은 振荡) | التذبذب | oscilación | oscillation | दोलन | osilasi | oscilação |
| p-type / n-type | p형 · n형 | p型 / n型 | p型 / n型 | النوع p / النوع n | tipo p · tipo n | type p · type n | p-प्रकार / n-प्रकार | tipe-p / tipe-n | tipo p · tipo n |
| parallel / in parallel | 병렬 | 並列 | 并联 | على التوازي | en paralelo | en parallèle | पार्श्वक्रम | paralel | em paralelo |
| parallel | 나란한 (평행) | 平行 | 平行 | متوازٍ | paralelo | parallèle | समांतर | sejajar | paralelo |
| parallel plates / parallel-plate | 평행판 | 平行板 | 平行板 | لوحان متوازيان | placas paralelas | plaques parallèles · condensateur plan | समांतर प्लेट | keping sejajar | placas paralelas |
| pendulum / pendulums | 진자 | 振り子 | 摆 | البندول | péndulo | pendule | लोलक | bandul | pêndulo |
| period | 주기 | 周期 | 周期 | الدور | periodo | période | आवर्तकाल | periode | período |
| phase / in phase / phase difference | 위상 (파동·교류) | 位相 (in phase → 位相がそろう) | 相位 (同相·反相) | الطور | fase (en fase) | phase (en phase) | कला | fase (sefase) | fase (em fase) |
| phase diagram / phase | 상 (물질의 상태) | 状態図 (phase diagram) | 相 (相图) | مخطط الأطوار / طور | fase (diagrama de fases) | diagramme de phases | प्रावस्था (phase diagram = प्रावस्था आरेख) | fase (diagram fase) | diagrama de fases |
| phase difference | 위상차 | 位相差 | 相位差 | فرق الطور | diferencia de fase | déphasage | कलांतर | beda fase | diferença de fase |
| photon / photons | 광자 | 光子 | 光子 | فوتون | fotón | photon | फोटॉन | foton | fóton |
| pinhole | 바늘구멍 | ピンホール | 小孔 | ثقب / الكاميرا ذات الثقب | orificio (cámara estenopeica) | sténopé | सूचिछिद्र | lubang jarum | orifício (câmara escura de orifício) |
| piston | 피스톤 | ピストン | 活塞 | المكبس | pistón | piston | पिस्टन | piston | pistão |
| plane mirror | 평면거울 | 平面鏡 | 平面镜 | مرآة مستوية | espejo plano | miroir plan | समतल दर्पण | cermin datar | espelho plano |
| planet / planets | 행성 | 惑星 | 行星 | الكوكب | planeta | planète | ग्रह | planet | planeta |
| polarization / polarized / polarizer | 편광 | 偏光 / 偏光板 | 偏振 | الاستقطاب | polarización / polarizado / polarizador | polarisation / polarisé(e) / polariseur | ध्रुवण / ध्रुवित / ध्रुवक | polarisasi / polarisator | polarização / polarizado / polarizador |
| pole / N pole / S pole | 자극 | 磁極 / N極 / S極 | 磁极 | قطب | polo (polo N / polo S) | pôle (pôle N / pôle S) | ध्रुव (N ध्रुव / S ध्रुव) | kutub (kutub N / kutub S) | polo (polo N / polo S) |
| positive / negative | 양(+) · 음(−) | 正 / 負 | 正 / 负 | موجب / سالب | positivo / negativo | positif / négatif | धन / ऋण (धनात्मक / ऋणात्मक, धनावेश) | positif / negatif | positivo / negativo |
| potential / electric potential | 전위 | 電位 | 电势 | الجهد | potencial | potentiel (électrique) | विभव | potensial (listrik) | potencial (elétrico) |
| potential energy | 위치 에너지 (퍼텐셜 에너지) | 位置エネルギー | 势能 | طاقة الوضع | energía potencial | énergie potentielle | स्थितिज ऊर्जा | energi potensial | energia potencial |
| power | 일률·전력 (단위 시간당 에너지) | 仕事率 (전기는 電力) | 功率 | القدرة | potencia | puissance | शक्ति | daya | potência |
| power / power bar | 굴절력 (렌즈) | 屈折力 | 光焦度 | قوة التكبير | potencia (óptica) | vergence | क्षमता | kuat lensa | vergência |
| power transmission / power line / power plant | 송전 · 송전선 · 발전소 | 送電 / 送電線 / 発電所 | 输电 · 输电线 · 发电厂 | نقل الطاقة الكهربائية · خط النقل · محطة الكهرباء | transmisión de energía eléctrica · línea eléctrica · central eléctrica | transport de l’électricité · ligne électrique · centrale électrique | विद्युत पारेषण · पारेषण लाइन · बिजलीघर | transmisi daya listrik · saluran transmisi · pembangkit listrik | transmissão de energia elétrica · linha de transmissão · usina elétrica |
| pressure | 압력 (일반) | 圧力 | 压强 (대기압만 气压 · 大气压, 복사압 辐射压) | الضغط | presión | pression | दाब | tekanan | pressão |
| pressure / pressure ↑ | 그래프 축 — 압력 | 圧力 | 压强 | الضغط | presión | pression | दाब | tekanan | pressão |
| probability | 확률 | 確率 | 概率 | احتمال | probabilidad | probabilité | प्रायिकता | probabilitas | probabilidade |
| projectile | 포물체 (던진 물체) | 放物運動 (projectile motion) / 投げた物体 | 抛体 | المقذوف | proyectil | projectile | प्रक्षेप्य | gerak parabola | projétil |
| proportional | 비례 | 比例する | 成正比 | متناسب / يتناسب | Cuanto más rápido va, más abruptamente crece la parte del arrastre proporcional al cuadrado de la rapidez | proportionnel(le) | समानुपाती | sebanding | proporcional |
| proton / protons | 양성자 | 陽子 | 质子 | بروتون | protón | proton | प्रोटॉन | proton | próton |
| pulse | 펄스 (한 번의 파동) | パルス | 脉冲 | نبضة | pulso | impulsion | स्पंद | pulsa | pulso |
| P–V diagram / p-v diagram | P–V 그림 | P–V 図 | P–V 图 | مخطط P–V | diagrama P–V | diagramme P–V | P–V आरेख | diagram P–V | diagrama P–V |
| quantum | 양자 | 量子 | 量子 | كمومي | cuántico/cuántica | quantique | क्वांटम | kuantum | quântico(a) |
| radiation | 복사 · 방사선 | 放射 (열·전자기 복사) / 放射線 (방사선) | 辐射 | إشعاع | radiación | rayonnement | विकिरण | radiasi | radiação |
| radiation pressure | 복사압 | 放射圧 | 辐射压 | ضغط الإشعاع | presión de radiación | pression de radiation | विकिरण दाब | tekanan radiasi | pressão de radiação |
| radius | 반지름 | 半径 | 逃逸速度达到光速时的半径 | نصف القطر | radio | rayon | त्रिज्या | jari-jari | raio |
| ray / rays | 광선 | 光線 (파동의 ray 는 射線, X-ray → X線) | 光线 (파동의 ray 는 波线, X-ray 射线) | شعاع / أشعة | rayo | rayon | किरण | sinar (Sinar-X, sinar gamma) | raio (raios X · raios gama) |
| reactance / impedance | 리액턴스 · 임피던스 | リアクタンス / インピーダンス | 电抗 / 阻抗 | المفاعلة / الممانعة | reactancia · impedancia | réactance · impédance | प्रतिघात / प्रतिबाधा | reaktansi / impedansi | reatância · impedância |
| real image | 실상 | 実像 | 实像 | صورة حقيقية | imagen real | image réelle | वास्तविक प्रतिबिंब | bayangan nyata | imagem real |
| recoil / recoils | 되튐 (반동) | 反動 | 反冲 | الارتداد / يرتد | retroceso (retroceder) | reculer / recul | प्रतिक्षेप (동사 पीछे हटना) | tolakan (명사) / terdorong mundur (동사) | recuo / recuar |
| red light / red | 빨강 (빛) | 赤い光 / 赤 | 红光 | الأحمر | luz roja / rojo | lumière rouge | लाल प्रकाश | cahaya merah | luz vermelha / vermelho |
| reflection / reflects / reflected | 반사 | 反射 (reflected beam → 反射光) | 反射 | الانعكاس / المنعكس | reflexión / reflejado | réflexion / réfléchi(e) | परावर्तन / परावर्तित | pemantulan / pantul (sinar pantul, berkas pantul) | reflexão / refletido |
| refraction / refracts / refracted | 굴절 | 屈折 | 折射 | الانكسار / المنكسر | refracción / refractado | réfraction / réfracté(e) | अपवर्तन / अपवर्तित | pembiasan / bias (berkas bias) | refração / refratado |
| refractive index / index | 굴절률 | 屈折率 | 折射率 | معامل الانكسار | índice de refracción | indice de réfraction | अपवर्तनांक | indeks bias | índice de refração |
| relativistic / relativity | 상대론적 · 상대성 | 相対論的 / 相対性 | 相对论 | نسبي | relativista · relatividad | relativiste · relativité | आपेक्षिक / आपेक्षिकता | relativistik / relativitas | relativístico(a) · relatividade |
| resistance | 저항 (물리량) | 抵抗 | 电阻 | المقاومة | resistencia | résistance | प्रतिरोध | hambatan | resistência |
| resistor / resistors | 저항기 | 抵抗 | 电阻 | مقاومة | resistencia | résistance | प्रतिरोध | hambatan | resistor |
| resonance / resonates | 공명 | 共振 (역학·전기) / 共鳴 (기주·음향) | 共振 (소리·기주 공명은 共鸣) | الرنين | resonancia | résonance | अनुनाद | resonansi | ressonância |
| Rest frame / rest frame | 정지 기준틀 | 静止系 | 静止参考系 | إطار السكون | sistema en reposo | référentiel au repos | विराम निर्देश तंत्र | kerangka acuan diam | referencial de repouso |
| restoring force | 복원력 | 復元力 | 恢复力 | قوة الإرجاع | fuerza restauradora | force de rappel | प्रत्यानयन बल | gaya pemulih | força restauradora |
| retina | 망막 | 網膜 | 视网膜 | الشبكية | retina | rétine | रेटिना | retina | retina |
| Reynolds number | 레이놀즈 수 | レイノルズ数 | 雷诺数 | عدد رينولدز | número de Reynolds | nombre de Reynolds | रेनॉल्ड्स संख्या | bilangan Reynolds | número de Reynolds |
| ripple tank | 물결통 | リップルタンク | 水波槽 | حوض الموجات | cubeta de ondas | cuve à ondes | रिपल टैंक | tangki riak | cuba de ondas |
| Roche limit | 로슈 한계 | ロッシュ限界 | 洛希极限 | حد روش | límite de Roche | limite de Roche | रोश सीमा | batas Roche | limite de Roche |
| rotation / rotates | 자전 | 自転 | 自转 | دوران | rotación | rotation | घूर्णन | rotasi | rotação |
| Rough floor / Frictionless floor | 거친 바닥 / 마찰 없는 바닥 | 粗い床 / 摩擦のない床 | 粗糙地面 | أرضية خشنة / أرضية عديمة الاحتكاك | Suelo rugoso · Suelo sin rozamiento | Sol rugueux / Sol sans frottement | खुरदरा फ़र्श / घर्षणरहित फ़र्श | Lantai kasar | piso áspero / piso sem atrito |
| satellite | 위성 | 衛星 | 卫星 | القمر الصناعي | satélite | satellite | उपग्रह | satelit | satélite |
| scattering / scatters | 산란 | 散乱 | 散射 | تشتت | dispersión (dispersarse) | diffusion (광학·입자) · se disperser (물체가 흩어짐) | प्रकीर्णन (빛의 산란) · बिखरना (분자·덩어리가 흩어짐) | hamburan (terhambur) | espalhamento (espalhar) |
| screen | 스크린 | スクリーン | 光屏 | الشاشة | pantalla | écran | पर्दा | layar | tela |
| season / seasons | 계절 | 季節 | 季节 | الفصول | estación | saison | ऋतु | musim | estações |
| semi-major axis | 긴반지름 | 長半径 | 半长轴 | نصف المحور الأكبر | semieje mayor | demi-grand axe | अर्ध-दीर्घ अक्ष | sumbu semi-mayor | semieixo maior |
| semiconductor | 반도체 | 半導体 | 半导体 | شبه موصل | semiconductor | semi-conducteur | अर्धचालक | semikonduktor | semicondutor |
| series / in series | 직렬 | 直列 | 串联 | على التوالي | en serie | en série | श्रेणीक्रम | seri | em série |
| shadow | 그림자 | 影 | 影子 | الظل | sombra | ombre | छाया | bayangan (zona bayangan) | sombra |
| shock wave | 충격파 | 衝撃波 | 激波 | موجة الصدمة | onda de choque | onde de choc | आघात तरंग | gelombang kejut | onda de choque |
| Side by side | 나란히 (비교 배치) | 並べて (X side by side → Xを並べて) | 并排 | جنبًا إلى جنب | Lado a lado | côte à côte | साथ-साथ | Berdampingan | lado a lado |
| Side view / From the side / seen from the side | 옆에서 본 모습 (view 이름) | 側面図 (Side view) / 横から (From the side) | 侧视图 (Side view) / 侧视 (From the side) | منظر جانبي (Side view) · من الجانب (From the side) | Vista lateral (Side view) · De lado (From the side) · visto de lado | Vue de côté / De côté / vu de côté | पार्श्व दृश्य (Side view) · बगल से (From the side) | Tampak samping | Vista lateral (Side view) · De lado (From the side) |
| simple harmonic motion | 단진동 | 単振動 | 简谐运动 | الحركة التوافقية البسيطة | movimiento armónico simple | mouvement harmonique simple | सरल आवर्त गति | gerak harmonik sederhana | movimento harmônico simples |
| simultaneity / at the same time | 동시성 | 同時性 / 同時刻線 | 同时 (同时的相对性·同时线) | التزامن | simultaneidad | simultanéité | समकालिकता | keserempakan | simultaneidade |
| slit / slits | 슬릿 (틈) | スリット | 狭缝 | شق | rendija | fente | झिरी | celah | fenda |
| slope | 기울기 (그래프) | 傾き (그래프) / 斜面 (경사면) | 그래프 기울기 斜率 · 경사면 斜面(倾角) | الميل (그래프 기울기) · المنحدر (비탈면) | pendiente (경사면 각이면 inclinación) | pente | ढाल (그래프 기울기) · ढलान (비탈) | kemiringan (그래프 기울기) · lereng / bidang miring (경사면) | inclinação (gráfico) · rampa (plano inclinado) |
| solar eclipse | 일식 | 日食 | 日食 | كسوف الشمس | eclipse solar | éclipse de Soleil | सूर्य ग्रहण | gerhana Matahari | eclipse solar |
| solar mass / solar masses | 태양 질량 | 太陽質量 (n solar masses → 太陽質量の{n}倍) | 太阳质量 | كتلة شمسية | masa solar | masse solaire | सौर द्रव्यमान | massa Matahari | massa solar |
| solid | 고체 | 固体 | 固体 | صلب | sólido | solide | ठोस | padatan (상태 형용사 padat) | sólido |
| sound | 소리 (음파) | 音 (speed of sound → 音速) | 声音 (sound intensity 声强, speed of sound 声速) | الصوت | sonido | son | ध्वनि | bunyi | som |
| source | 음원 | 音源 | 声源 | المصدر | fuente | source | स्रोत | sumber bunyi | fonte (sonora) |
| source / light source | 광원 | 光源 | 光源 | مصدر الضوء | fuente (de luz) | source lumineuse | प्रकाश स्रोत | sumber cahaya | fonte de luz |
| spacetime | 시공간 | 時空 | 时空 | الزمكان | espaciotemporal (diagrama espaciotemporal) | espace-temps | दिक्काल | ruang-waktu | espaço-tempo |
| spectrum | 스펙트럼 | スペクトル | 光谱 (spectral line 谱线, spectral class 光谱型) | طيف | espectro | spectre / spectral(e) | स्पेक्ट्रम | spektrum | espectro / espectral |
| speed / speeds | 속력 (스칼라) | 速さ | 速率 | السرعة | rapidez | vitesse | चाल | kelajuan | velocidade |
| speed of light / light speed | 광속 | 光速 | 光速 | سرعة الضوء | velocidad de la luz | vitesse de la lumière | प्रकाश की चाल | kecepatan cahaya | velocidade da luz |
| spin | 스핀 (양자) | スピン | 自旋 | السبين | espín | spin | स्पिन | spin | spin |
| spin / spin speed | 회전 (돌기) | 回転 | 旋转 / 转动 | الدوران | giro | rotation · vitesse de rotation | घूर्णन | putaran | giro · rotação |
| spring / springs | 용수철 | ばね | 弹簧 (계절은 春季) | النابض | resorte | ressort (계절 spring 은 printemps) | स्प्रिंग | pegas | mola |
| star / stars | 별 (항성) | 星 | 恒星 | النجم | estrella | étoile | तारा | bintang | estrela |
| stopping distance | 정지 거리 | 停止距離 | 停车距离 | مسافة التوقف | distancia de detención | distance d’arrêt | रुकने की दूरी | jarak henti | distância de parada |
| Sun | 태양 | 太陽 | 太阳 | الشمس | Sol | Soleil | सूर्य | Matahari | Sol |
| sunlight | 햇빛 | 日光 | 阳光 | ضوء الشمس | luz solar | lumière du Soleil | सूर्य का प्रकाश | sinar Matahari | luz solar |
| superconductor / superconducting | 초전도체 | 超伝導体 / 超伝導 | 超导体 | موصل فائق / الموصلية الفائقة | superconductor · superconductividad | supraconducteur · supraconductivité | अतिचालक / अतिचालकता | superkonduktor / superkonduktivitas | supercondutor · supercondutividade |
| superposition | 중첩 | 重ね合わせ | 叠加 | التراكب | superposición | superposition | अध्यारोपण | superposisi | superposição |
| switch | 스위치 | スイッチ | 开关 | المفتاح | interruptor | interrupteur | स्विच | sakelar | chave |
| temperature | 온도 | 温度 | 温度 (absolute temperature 热力学温度) | درجة الحرارة | temperatura | température (약자 Temp.) | ताप | suhu | temperatura (약어 Temp.) |
| temperature / Temp. / temperature → | 그래프 축 — 온도 | 温度 | 温度 | درجة الحرارة | temperatura (Temp. 약어) | température / Temp. | ताप | suhu | temperatura / Temp. |
| tension | 장력 | 張力 | 张力 | قوة الشد | tensión | tension | तनाव | tegangan tali | tração |
| terminal voltage | 단자 전압 | 端子電圧 | 端电压 | الجهد الطرفي | voltaje en los bornes | tension aux bornes | टर्मिनल वोल्टता | tegangan jepit | tensão nos terminais |
| test charge | 시험 전하 | 試験電荷 | 试探电荷 | شحنة الاختبار | carga de prueba | charge d’essai | परीक्षण आवेश | muatan uji | carga de prova |
| The switch closes / switch closes / switch opens | 스위치를 닫는다 / 연다 | スイッチを閉じる / 開く | 闭合开关 / 断开开关 | يُغلَق المفتاح / يُفتَح المفتاح | El interruptor se cierra / se abre | l’interrupteur se ferme / s’ouvre | स्विच बंद होता है / खुलता है | sakelar ditutup / dibuka (상태: tertutup / terbuka) | a chave se fecha / se abre (a chave está fechada / aberta) |
| thermometer | 온도계 | 温度計 | 温度计 | مقياس الحرارة | termómetro | thermomètre | तापमापी | termometer | termômetro |
| threshold / threshold frequency | 문턱 (진동수) | しきい値 (일반) / しきい電圧 (다이오드) / 限界振動数 (광전 효과의 threshold frequency) | 阈值 / 截止频率 | العتبة | umbral · frecuencia umbral | seuil · fréquence seuil | देहली | ambang (frekuensi ambang) | limiar · frequência limiar |
| tidal / tide | 조석 (기조력) | 潮汐力 (tidal pull / tides → 潮汐力) | 潮汐力 (tidal pull/force) | قوة المد | marea · fuerza de marea | marée · force de marée | ज्वारीय (tidal pull = ज्वारीय खिंचाव, tidal force = ज्वारीय बल) | pasang surut (tidal pull = tarikan pasang surut, tidal force = gaya pasang surut) | maré / força de maré |
| tilt / axial tilt | 자전축 기울기 | 自転軸の傾き | 自转轴倾角 | ميل محور الدوران | inclinación del eje | inclinaison de l’axe | अक्षीय झुकाव | kemiringan sumbu rotasi | inclinação do eixo |
| time dilation | 시간 지연 | 時間の遅れ | 时间膨胀 | تمدد الزمن | dilatación del tiempo | dilatation du temps | काल विस्तारण | dilatasi waktu | dilatação do tempo |
| time → / time ↑ / time | 그래프 축 — 시간 | 時間 | 时间 | الزمن | tiempo | temps | समय | waktu | tempo |
| Top view / From above / seen from above | 위에서 본 모습 (view 이름) | 上から | 俯视(图) / 从…上方看 | من الأعلى · منظر علوي (Top view) | Vista superior (Top view) · Desde arriba (From above) · visto desde arriba | Vue de dessus / vu(e) de dessus | ऊपर से दृश्य (Top view) · ऊपर से देखी गई … (… from above) | dilihat dari atas / Tampak atas | visto/vista de cima |
| torque | 돌림힘 | トルク | 力矩 | عزم الدوران | torque | couple | बल-आघूर्ण | torsi | torque |
| total internal reflection | 전반사 | 全反射 | 全反射 | الانعكاس الكلي الداخلي | reflexión total interna | réflexion totale interne | पूर्ण आंतरिक परावर्तन | pemantulan sempurna | reflexão interna total |
| transformer | 변압기 | 変圧器 | 变压器 | المحوّل | transformador | transformateur | ट्रांसफ़ॉर्मर | transformator | transformador |
| triple point | 삼중점 | 三重点 | 三相点 | النقطة الثلاثية | punto triple | point triple | त्रिक बिंदु | titik tripel | ponto triplo |
| trough | 골 | 谷 | 波谷 | القاع | valle | creux | गर्त | lembah | vale |
| tunneling / tunnels | 터널링 | トンネル効果 / トンネルする | 隧穿 | النفق الكمومي | efecto túnel | effet tunnel | सुरंगन | penerowongan / menerobos | tunelamento |
| Two frames / Two bodies / Two tubes | 둘을 나란히 비교하는 stage 이름 (두 ~) | 二つの X / 二本の X (한자 수사 + 알맞은 조수사) | 两个/两条/两根 … (양사는 사물에 맞게) | 두 ~ = 쌍수형(جسمان · مساران …) | Dos + sustantivo (Dos sistemas de referencia · Dos cuerpos · Dos tubos …) | Deux + 복수 명사 | दो + 명사 (Two boxes डिब्बे · Two wheels पहिए) | Dua … | Dois/Duas ~ |
| Two lanes / Three lanes / lane | 나란한 레인 (비교용 줄) | レーン (二つのレーン·三つのレーン) | 通道 | مسار | carril / carriles (Dos carriles · Tres carriles) | couloir(s) | लेन | lajur | faixa |
| ultraviolet / UV | 자외선 | 紫外線 | 紫外线 | الأشعة فوق البنفسجية (짧은 라벨 فوق البنفسجية) | ultravioleta (UV) | ultraviolet (UV) | पराबैंगनी | ultraungu (label singkat UV) | ultravioleta (약자 UV) |
| umbra / penumbra | 본그림자 · 반그림자 | 本影 / 半影 | 本影 / 半影 | الظل / شبه الظل | umbra · penumbra | ombre / pénombre | प्रच्छाया / उपच्छाया | umbra / penumbra | umbra / penumbra |
| uniform circular motion | 등속 원운동 | 等速円運動 | 匀速圆周运动 | الحركة الدائرية المنتظمة | movimiento circular uniforme | mouvement circulaire uniforme | एकसमान वृत्तीय गति | gerak melingkar beraturan | movimento circular uniforme |
| upright / upright image | 바로 선 (정립) | 正立 (正立像) | 正立 | معتدلة | derecha (imagen derecha) | droit(e) | सीधा प्रतिबिंब | tegak | direita (imagem direita) |
| upside-down / upside down / inverted | 거꾸로 선 (도립) | 倒立 (倒立像) | 倒立 (파동 반전은 反相·翻转) | مقلوبة | invertida (imagen invertida) | renversé(e) | उल्टा | terbalik | invertido/invertida |
| vector | 벡터 | ベクトル | 坡印廷矢量 | متجه | vector · vectorial | vecteur (형용 vectoriel) | सदिश | vektor | vetor · vetorial |
| velocity / velocities | 속도 (벡터) | 速度 | 速度 | السرعة | velocidad | vitesse | वेग | kecepatan | velocidade |
| vibration / vibrates | 진동 (떨림) | 振動 | 振动 | الاهتزاز | vibración | vibration / vibrer | कंपन | getaran / bergetar | vibração / vibrar |
| virtual image | 허상 | 虚像 | 虚像 | صورة وهمية | imagen virtual | image virtuelle | आभासी प्रतिबिंब | bayangan maya | imagem virtual |
| viscosity / viscous | 점성 | 粘性 | 黏性 (viscous liquid 黏稠液体) | اللزوجة / لزج | viscosidad / viscoso | viscosité / visqueux | श्यानता / श्यान | viskositas (viscous = kental) | viscosidade / viscoso |
| visible / visible light | 가시광 | 可視光 | 可见光 | المرئي | visible / luz visible | visible / lumière visible | दृश्य (प्रकाश) | cahaya tampak | visível / luz visível |
| voltage | 전압 | 電圧 | 电压 | الجهد | voltaje | tension | वोल्टता | tegangan | tensão |
| volume | 부피 | 体積 | 体积 | الحجم | volumen | volume | आयतन | volume | volume |
| W | 방위 서 | 西 | 西 | غرب | O | O | पश्चिम | B | O |
| water level / level | 수위 (액면 높이) | 水位 / 水面 | 液面 | مستوى الماء | nivel del agua | niveau | जल स्तर | permukaan air | nível da água |
| wave / waves | 파동 (물결) | 波 (電磁波・衝撃波・地震波 등 복합어는 관용) | 波 (电磁波·物质波·激波·纵波·横波; 물결 조각은 水波) | موجة / الموجات | onda | onde | तरंग | gelombang (half-wave = setengah gelombang) | onda |
| wave function | 파동 함수 | 波動関数 | 波函数 | دالة الموجة | función de onda | fonction d’onde | तरंग फलन | fungsi gelombang | função de onda |
| wavefront / wavefronts / wave fronts | 파면 | 波面 (wavelet → 素元波) | 波前 | جبهة الموجة | frente de onda | front d’onde | तरंगाग्र | muka gelombang | frente de onda |
| wavelength | 파장 | 波長 (half wavelength → 半波長) | 波长 | الطول الموجي | longitud de onda | longueur d’onde | तरंगदैर्घ्य | panjang gelombang | comprimento de onda |
| weight | 무게 (중력의 크기) | 重さ | 重力 | الوزن | peso | poids | भार | berat | peso |
| weights | 추 (올려놓는 물체) | おもり | 砝码 / 重物 | أثقال | pesas | masse marquée | बाट | beban | pesos |
| weights / light weight | 추 (올려놓는 물체) — 그 밖의 조각 | おもり | 砝码 / 重物 | أثقال | pesas | masse marquée | बाट | beban | pesos |
| white light | 백색광 | 白色光 | 白光 | الضوء الأبيض | luz blanca | lumière blanche | श्वेत प्रकाश | cahaya putih | luz branca |
| wire / wires | 도선 | 導線 | 导线 | سلك | cable | fil | तार | kawat | fio |
| work / work done | 일 (물리량) | 仕事 | 功 | الشغل | trabajo | travail | कार्य | usaha | trabalho |
| work function | 일함수 | 仕事関数 | 逸出功 | دالة الشغل | función de trabajo | travail de sortie | कार्य फलन | fungsi kerja | função trabalho |
