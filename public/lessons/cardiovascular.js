// Atlas Vivo — aprofundamento do sistema cardiovascular. A aula principal tem template próprio (6 seções, fluxograma
// animado e ampliação do capilar) e continua como está; este arquivo acrescenta os capítulos que ela não cobre.
// Texto original em português, escrito para este projeto.
(window.AV_LESSON_DEEP = window.AV_LESSON_DEEP || {}).cardiovascular = {
  title: 'Sistema cardiovascular: aprofundamento', short: 'Cardiovascular', hero: 'r-cardiovascular', dur: 55,
  lead: 'Ciclo cardíaco, impulso elétrico, pressão arterial, sangue e doenças: o que vem depois da aula principal.',
  goals: ['Acompanhar um ciclo cardíaco e o débito cardíaco.', 'Entender o sistema de condução elétrica do coração.', 'Relacionar pressão arterial, resistência e regulação.', 'Conhecer a composição do sangue, a coagulação e os grupos sanguíneos.', 'Reconhecer os fatores de risco das doenças cardiovasculares.'],
  enem: [
    'Circulação dupla e completa, valvas e o caminho do sangue.',
    'Pressão arterial, hipertensão e fatores de risco.',
    'Grupos sanguíneos ABO e Rh: transfusões e eritroblastose fetal (aparece também em genética).',
    'Coagulação, anemias, composição do sangue e hemoglobina.',
    'Doenças cardiovasculares e doença de Chagas.'],
  refs: [
    ['OpenStax — Anatomia e Fisiologia 2e, cap. 19–20: O sistema cardiovascular', 'https://openstax.org/books/anatomy-and-physiology-2e/pages/19-introduction', 'CC BY-NC-SA 4.0, consulta para conferir fatos; texto próprio'],
    ['Ministério da Saúde — Biblioteca Virtual em Saúde (BVS/MS)', 'https://bvsms.saude.gov.br/', 'publicações oficiais, consulta'],
    ['Matriz de Referência do Enem (Inep)', 'https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/matrizes-de-referencia-enem', 'documento oficial']],
  secs: [
    { ch: 'Cap. 1, O coração', t: 'Camadas, câmaras e valvas', h: 'O coração como bomba dupla', m: { sys: ['cardiovascular'], parts: ['cardiovascular', ['parede do coração']] }, b: [
      { p: 'A parede do coração tem três camadas: o endocárdio (revestimento interno liso, em contato com o sangue), o miocárdio (músculo cardíaco, a camada mais espessa e responsável pela contração) e o epicárdio, parte do pericárdio, o saco que envolve o coração. O músculo cardíaco é estriado, involuntário e ligado em rede por discos intercalares, que permitem que o impulso elétrico se espalhe rapidamente.' },
      { table: { cap: 'Valvas do coração e para onde abrem', head: ['Valva', 'Entre quais estruturas', 'Impede o retorno de sangue para'], rows: [
        ['Tricúspide (atrioventricular direita)', 'Átrio direito e ventrículo direito', 'O átrio direito'],
        ['Pulmonar (semilunar)', 'Ventrículo direito e tronco pulmonar', 'O ventrículo direito'],
        ['Mitral ou bicúspide (atrioventricular esquerda)', 'Átrio esquerdo e ventrículo esquerdo', 'O átrio esquerdo'],
        ['Aórtica (semilunar)', 'Ventrículo esquerdo e aorta', 'O ventrículo esquerdo']] } },
      { p: 'A parede do ventrículo esquerdo é mais espessa que a do direito porque ele impulsiona o sangue para todo o corpo, contra resistência muito maior que a da circulação pulmonar. O próprio coração é irrigado pelas artérias coronárias, ramos da aorta; a obstrução de uma coronária é a causa do infarto.' },
    ] },
    { ch: 'Cap. 1, O coração', t: 'Ciclo cardíaco', h: 'Um batimento, em quatro tempos', m: { sys: ['cardiovascular'] }, b: [
      { steps: { t: 'um ciclo cardíaco', items: [
        'Enchimento (diástole): as valvas atrioventriculares estão abertas e o sangue flui dos átrios para os ventrículos; a contração atrial completa o enchimento.',
        'Contração isovolumétrica (início da sístole): as valvas atrioventriculares se fecham (primeiro som cardíaco, “tum”); a pressão nos ventrículos sobe sem que o sangue saia ainda.',
        'Ejeção: quando a pressão ventricular passa a das artérias, as valvas semilunares se abrem e o sangue sai para a aorta e para o tronco pulmonar.',
        'Relaxamento isovolumétrico: a pressão cai, as valvas semilunares se fecham (segundo som, “tá”) e o ciclo recomeça.'] } },
      { def: [['Frequência cardíaca (FC)', 'batimentos por minuto; em repouso, em adultos, geralmente de 60 a 100.'], ['Volume sistólico (VS)', 'sangue ejetado por um ventrículo a cada batimento; cerca de 70 mL em repouso.'], ['Débito cardíaco', 'FC × VS. Em repouso, cerca de 5 litros por minuto, quase todo o volume de sangue do corpo.']] },
      { p: 'Quanto mais o ventrículo é distendido pelo enchimento, mais forte é a contração seguinte (mecanismo de Frank-Starling). Assim o coração ajusta o que ejeta ao que recebe. No exercício, a frequência e o volume sistólico aumentam e o débito pode multiplicar-se por cinco ou mais em atletas.' },
    ] },
    { ch: 'Cap. 1, O coração', t: 'Impulso elétrico', h: 'Quem dá o compasso', m: { sys: ['cardiovascular', 'nervoso'] }, b: [
      { p: 'O coração se contrai sem precisar de comando do encéfalo: um grupo de células musculares especializadas, o nó sinoatrial (marca-passo natural, no átrio direito), gera impulsos espontaneamente. A frequência é modulada pelo sistema nervoso autônomo: o simpático (noradrenalina, adrenalina) acelera; o parassimpático, pelo nervo vago (acetilcolina), desacelera.' },
      { steps: { t: 'caminho do impulso', items: [
        'O nó sinoatrial dispara e o impulso se espalha pelos átrios, que se contraem.',
        'O impulso chega ao nó atrioventricular, onde sofre um pequeno atraso que permite o enchimento dos ventrículos.',
        'Segue pelo feixe de His e pelos ramos direito e esquerdo.',
        'As fibras de Purkinje espalham o impulso pelos ventrículos, que se contraem de baixo para cima, empurrando o sangue para as artérias.'] } },
      { p: 'O eletrocardiograma (ECG) registra a atividade elétrica: a onda P corresponde à ativação dos átrios, o complexo QRS à dos ventrículos e a onda T ao retorno dos ventrículos ao repouso. Falhas no sistema de condução causam arritmias; o marca-passo artificial substitui o nó sinoatrial, e o desfibrilador usa choque elétrico para interromper uma fibrilação ventricular, restabelecendo um ritmo organizado.' },
    ] },
    { ch: 'Cap. 2, Vasos e pressão', t: 'Vasos, fluxo e pressão arterial', h: 'Por que o sangue anda e como se mede o esforço', m: { sys: ['cardiovascular'] }, b: [
      { p: 'Os vasos têm três túnicas: a interna (endotélio), a média (músculo liso e fibras elásticas) e a externa (tecido conjuntivo). As artérias são mais espessas e elásticas, absorvendo o impulso de cada batimento; as arteríolas regulam a resistência e, portanto, a distribuição do fluxo; os capilares permitem as trocas; as veias são mais finas, com valvas que impedem o refluxo e dependem da contração dos músculos esqueléticos ao redor (bomba muscular) e dos movimentos respiratórios para o retorno ao coração.' },
      { p: 'O fluxo depende da diferença de pressão entre dois pontos e da resistência do trajeto: quanto maior a diferença de pressão, maior o fluxo; quanto maior a resistência (vasos estreitos), menor. A pressão arterial é a pressão exercida pelo sangue contra a parede das artérias. É registrada com dois valores: a pressão sistólica (durante a ejeção) e a diastólica (entre os batimentos). Em um adulto, a referência clássica é de cerca de 120 por 80 mmHg (“12 por 8”).' },
      { table: { cap: 'Regulação da pressão arterial', head: ['Mecanismo', 'Como atua', 'Resultado'], rows: [
        ['Barorreceptores (seios carotídeos e arco da aorta)', 'Detectam o estiramento da parede arterial e avisam o bulbo', 'Queda da pressão: aumenta a frequência e contrai vasos. Alta da pressão: o oposto.'],
        ['Sistema renina-angiotensina-aldosterona', 'A queda da pressão nos rins libera renina; forma-se angiotensina II, que contrai vasos e estimula a aldosterona', 'Mais sódio e água retidos pelo rim, pressão sobe'],
        ['Hormônio antidiurético (ADH)', 'Estimula a reabsorção de água nos rins', 'Aumenta o volume de sangue'],
        ['Adrenalina', 'Aumenta a frequência e a força do coração', 'Aumenta o débito cardíaco']] } },
      { note: ['Hipertensão', 'A hipertensão arterial sustentada (em consultório, geralmente a partir de 140/90 mmHg, segundo as diretrizes brasileiras) costuma não dar sintomas e lesa gradualmente vasos, coração, rins e encéfalo. É o principal fator de risco para AVC e infarto. Controlar sal, peso, atividade física e álcool, e usar a medicação prescrita, reduz o risco.'] },
    ] },
    { ch: 'Cap. 3, O sangue', t: 'Composição do sangue e coagulação', h: 'Um tecido conjuntivo líquido', m: { sys: ['cardiovascular'] }, b: [
      { p: 'O sangue é formado por plasma (cerca de 55% do volume; água, proteínas, sais, nutrientes e hormônios) e por elementos figurados (hemácias, leucócitos e plaquetas), produzidos principalmente na medula óssea vermelha. O hematócrito é a proporção de volume ocupada pelas hemácias, em torno de 40% a 45% nos adultos.' },
      { table: { cap: 'Elementos do sangue', head: ['Elemento', 'Função', 'Observação'], rows: [
        ['Hemácias (eritrócitos)', 'Transportam O₂ ligado à hemoglobina', 'Em mamíferos, perdem o núcleo ao amadurecer; vivem cerca de 120 dias e são destruídas no baço e no fígado'],
        ['Leucócitos', 'Defesa do organismo', 'Neutrófilos e monócitos fagocitam; linfócitos B e T participam da imunidade adquirida; eosinófilos e basófilos atuam em parasitoses e alergias'],
        ['Plaquetas (trombócitos)', 'Coagulação', 'Fragmentos de células da medula (megacariócitos), sem núcleo']] } },
      { steps: { t: 'hemostasia depois de um corte', items: [
        'O vaso lesado se contrai, reduzindo o sangramento.',
        'As plaquetas aderem ao local e formam um tampão.',
        'Fatores de coagulação, dependentes de vitamina K, ativam uma cascata que converte o fibrinogênio, proteína do plasma, em fibrina.',
        'A rede de fibrina prende as células e forma o coágulo, que depois é dissolvido quando o tecido cicatriza.'] } },
      { p: 'A formação de coágulo dentro de um vaso (trombo) pode obstruí-lo e, se se solta, vira êmbolo e pode alojar-se em artérias menores. Na hemofilia, doença genética ligada ao cromossomo X, faltam fatores de coagulação. Anemias reduzem a quantidade de hemoglobina: a ferropriva por falta de ferro, a megaloblástica por falta de B₁₂ ou folato e a falciforme é hereditária, causada por uma hemoglobina anormal.' },
    ] },
    { ch: 'Cap. 3, O sangue', t: 'Grupos sanguíneos e transfusão', h: 'ABO e Rh', m: { sys: ['cardiovascular'] }, b: [
      { p: 'O sistema ABO se baseia na presença de aglutinogênios (antígenos) na membrana das hemácias: A, B, ambos (AB) ou nenhum (O). O plasma contém anticorpos contra os antígenos que a pessoa não tem. A herança é determinada por três alelos (Iᴬ, Iᴮ, i), com Iᴬ e Iᴮ codominantes e i recessivo.' },
      { table: { cap: 'Sistema ABO', head: ['Tipo', 'Antígenos nas hemácias', 'Anticorpos no plasma', 'Pode receber sangue de'], rows: [
        ['A', 'A', 'Anti-B', 'A e O'],
        ['B', 'B', 'Anti-A', 'B e O'],
        ['AB', 'A e B', 'Nenhum', 'A, B, AB e O (receptor universal)'],
        ['O', 'Nenhum', 'Anti-A e anti-B', 'Somente O (mas doa a todos, doador universal)']] } },
      { p: 'O fator Rh é outro antígeno: quem o tem é Rh positivo; quem não tem é Rh negativo. Uma pessoa Rh negativa só produz anticorpos anti-Rh depois de ser exposta ao antígeno. Em uma gestação, se a mãe é Rh negativa e o feto Rh positivo, no parto o sangue fetal pode contatar o da mãe e sensibilizá-la. Em uma gestação seguinte de feto Rh positivo, os anticorpos da mãe atravessam a placenta e destroem as hemácias do feto: é a eritroblastose fetal (doença hemolítica do recém-nascido). A prevenção é feita com a aplicação de imunoglobulina anti-Rh na mãe após o parto.' },
      { warn: ['“Qualquer pessoa do tipo O pode receber sangue de qualquer um.”', 'É o contrário: o tipo O é doador universal para o sistema ABO porque suas hemácias não têm antígenos A nem B; mas o plasma tem anticorpos anti-A e anti-B e só tolera hemácias de O.'] },
    ] },
    { ch: 'Cap. 4, Saúde', t: 'Doenças cardiovasculares', h: 'Principais causas, fatores de risco e prevenção', m: { sys: ['cardiovascular'] }, b: [
      { table: { cap: 'Doenças cardiovasculares frequentes', head: ['Condição', 'O que ocorre', 'Fatores de risco e prevenção'], rows: [
        ['Aterosclerose', 'Placas de gordura (colesterol), inflamação e cálcio estreitam a parede das artérias', 'LDL elevado, tabagismo, hipertensão, diabetes, sedentarismo'],
        ['Infarto agudo do miocárdio', 'Obstrução de uma artéria coronária; parte do músculo cardíaco morre', 'Mesmos fatores; reconhecer dor no peito e procurar socorro imediato'],
        ['AVC', 'Interrupção do fluxo em uma artéria cerebral (isquêmico, o mais comum) ou ruptura de um vaso (hemorrágico)', 'Hipertensão é o principal fator; sinais de alerta: fraqueza de um lado do corpo, desvio da boca, dificuldade de fala'],
        ['Insuficiência cardíaca', 'O coração não bombeia o suficiente para as necessidades do corpo', 'Hipertensão e infarto prévios, doenças das valvas'],
        ['Doença de Chagas', 'Infecção pelo protozoário Trypanosoma cruzi, transmitido pelas fezes do barbeiro; também por transfusão, via oral (alimentos) e de mãe para filho', 'Controle do vetor, melhoria da moradia, triagem de doadores de sangue; pode causar cardiopatia chagásica'],
        ['Febre reumática', 'Reação autoimune após infecção de garganta por estreptococo; pode lesar valvas', 'Tratar infecções de garganta com antibióticos quando indicado']] } },
      { p: 'As doenças cardiovasculares estão entre as principais causas de morte no Brasil e no mundo. Muitas são evitáveis: não fumar, manter peso saudável, praticar atividade física regular, reduzir sal e ultraprocessados, moderar o álcool e controlar pressão, glicemia e colesterol. Essa lista aparece em quase toda prova que cobra “hábitos saudáveis”.' },
    ] },
    { ch: 'Cap. 5, Integração', t: 'O cardiovascular e os demais sistemas', h: 'Um sistema de transporte para todos', m: { sys: ['cardiovascular', 'respiratorio', 'urinario'] }, b: [
      { cols: [['Respiratório', 'A circulação pulmonar leva o sangue à hematose; a ventilação eleva o O₂ e remove o CO₂ trazido pelo sangue.'], ['Urinário', 'Os rins filtram uma fração grande do débito cardíaco e regulam o volume do sangue e a pressão arterial.'], ['Endócrino', 'Adrenalina, ADH, aldosterona e angiotensina II alteram frequência, vasos e volume.']] },
      { cols: [['Digestório', 'A veia porta leva nutrientes ao fígado; depois da refeição, o fluxo para o tubo aumenta.'], ['Linfático', 'Parte do líquido que sai dos capilares volta por vasos linfáticos, que desembocam nas veias subclávias.'], ['Tegumentar', 'Dilatação dos vasos da pele e suor ajudam a perder calor; frio contrai os vasos e preserva calor.']] },
      { recall: ['Durante uma corrida, por que o fluxo sanguíneo aumenta nos músculos e diminui no tubo digestório?', 'Porque as arteríolas dos músculos em atividade se dilatam e as do tubo se contraem por ação do sistema nervoso simpático: o sangue é redistribuído para onde a demanda de O₂ é maior.'] },
    ] },
  ],
  sint: {
    text: 'O coração é uma bomba dupla controlada por um marca-passo próprio, o nó sinoatrial, e modulada pelo sistema nervoso autônomo e por hormônios. O ciclo cardíaco alterna enchimento e ejeção, e as valvas garantem o sentido único do fluxo. A pressão arterial resulta do débito cardíaco e da resistência dos vasos e é regulada por barorreceptores e hormônios. O sangue transporta gases, nutrientes e hormônios, coagula para estancar hemorragias e tem grupos sanguíneos que importam nas transfusões e na gestação.',
    conf: [
      ['Artéria × veia', 'Artéria leva sangue para fora do coração; veia leva sangue para o coração, independentemente do teor de oxigênio.'],
      ['Sístole × diástole', 'Sístole é a contração; diástole é o relaxamento e enchimento.'],
      ['Trombo × êmbolo', 'Trombo é o coágulo preso à parede; êmbolo é o que se soltou e circula.'],
      ['Doador universal × receptor universal', 'O (ABO) doa para todos; AB recebe de todos. Rh é um critério à parte.']],
    cards: [
      ['Onde nasce o batimento cardíaco?', 'No nó sinoatrial, marca-passo natural do átrio direito.'],
      ['Qual é a fórmula do débito cardíaco?', 'Frequência cardíaca × volume sistólico.'],
      ['O que causa a primeira bulha cardíaca?', 'O fechamento das valvas atrioventriculares, no início da sístole.'],
      ['Que papel têm os barorreceptores?', 'Detectam variações na pressão arterial e ajustam frequência cardíaca e diâmetro dos vasos.'],
      ['Como ocorre a eritroblastose fetal?', 'Mãe Rh negativa sensibilizada por feto Rh positivo produz anti-Rh que, em gestação seguinte, destroem as hemácias fetais.'],
      ['Qual a diferença entre infarto e AVC?', 'Infarto é a obstrução de uma coronária (coração); AVC é a obstrução ou ruptura de vaso no encéfalo.'],
      ['Como a doença de Chagas se transmite?', 'Principalmente pelas fezes do barbeiro (vetor), mas também por transfusão, de mãe para filho e por alimentos contaminados.']],
  },
};
