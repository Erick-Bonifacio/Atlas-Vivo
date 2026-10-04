// Atlas Vivo — conteúdo das aulas (uma por quiz) e registro das imagens com seus créditos.
// Blocos de uma seção: {p} parágrafo · {fig, cap} figura do registro IMG · {cols} colunas [título, texto]
// · {warn} erro comum [frase, explicação] · {recall} pergunta de retomada [pergunta, resposta] · {note} [rótulo, texto]
(function () {
  const R = 'Render do Atlas Vivo · BodyParts3D © DBCLS, CC BY 4.0';
  const r = (alt) => ({ alt, credit: R, dark: true });
  const c = (file, alt, credit) => ({ file, alt, credit: credit + ' · Wikimedia Commons' });
  const IMG = {
    'r-corpo': r('Corpo humano translúcido com músculos e ossos visíveis'),
    'r-digestorio': r('Tubo digestório, fígado e intestinos em destaque no tronco'),
    'r-respiratorio': r('Traqueia e pulmões em destaque no tórax'),
    'r-cardiovascular': r('Coração e grandes vasos em destaque no tórax'),
    'r-urinario': r('Rins, ureteres e bexiga em destaque no abdome'),
    'r-nervoso': r('Encéfalo em destaque dentro da cabeça'),
    'r-endocrino': r('Glândulas suprarrenais em destaque no abdome'),
    'r-esqueletico': r('Esqueleto humano em vista frontal'),
    'r-muscular': r('Musculatura esquelética em vista frontal'),
    'r-tegumentar': r('Superfície da pele em vista frontal'),
    'r-linfatico': r('Timo e baço em destaque no tronco'),
    'r-reprodutor': r('Órgãos reprodutores masculinos em destaque na pelve'),
    'r-micro': r('Rede de capilares ligando uma arteríola a uma vênula entre fibras musculares'),
    coracao: c('Diagram of the human heart (cropped) pt.svg', 'Corte frontal do coração com câmaras, valvas e grandes vasos identificados', 'Wapcaplet, trad. Rhcastilhos · domínio público'),
    circulacao: c('Circulatory System pt.svg', 'Corpo humano com as principais artérias, em vermelho, e veias, em azul', 'LadyofHats, trad. Vini 175 · domínio público'),
    digestorio: c('Digestive system diagram pt.svg', 'Sistema digestório com boca, esôfago, estômago, fígado, pâncreas e intestinos identificados', 'Mariana Ruiz (LadyofHats), Jmarchn · domínio público'),
    respiratorio: c('Respiratory system-pt.svg', 'Sistema respiratório com nariz, boca, traqueia, pulmões e diafragma identificados', 'Theresa Knott, Angelito7 · CC BY-SA 3.0'),
    alveolo: c('Alveolus diagram.svg', 'Sacos alveolares envolvidos por capilares, com artéria e veia pulmonares', 'LadyofHats · domínio público · rótulos traduzidos'),
    urinario: c('Urinary system.svg', 'Sistema urinário com estruturas numeradas de 1 a 14', 'Jordi March i Nogué · CC BY-SA 3.0'),
    nefron: c('Nephron simple numbers.svg', 'Néfron com estruturas numeradas de 1 a 12', 'Jmarchn · CC BY-SA 3.0'),
    neuronio: c('Complete neuron cell diagram pt.svg', 'Neurônio com dendritos, corpo celular, axônio, bainha de mielina e sinapse identificados', 'Mariana Ruiz (LadyofHats) · domínio público'),
    reflexo: c('Imgnotraçat arc reflex eng.svg', 'Arco reflexo: do dedo à medula espinal pelo neurônio aferente e de volta ao músculo pelo eferente', 'MartaAguayo · CC BY-SA 3.0 · rótulos traduzidos'),
    endocrino: c('Endocrine English.svg', 'Principais glândulas endócrinas no corpo feminino e no masculino', 'OpenStax, Tomáš Kebert, umimeto.org · CC BY-SA 4.0 · rótulos traduzidos'),
    glicemia: c('Glicemia.svg', 'Ciclo de regulação da glicemia por insulina e glucagon entre pâncreas e fígado', 'Rhcastilhos · domínio público'),
    esqueleto: c('Axial skeleton diagram pt.svg', 'Esqueleto axial em destaque: crânio, coluna vertebral e caixa torácica', 'Mariana Ruiz (LadyofHats), trad. Angelito7 · domínio público'),
    articulacao: c('Joint es.svg', 'Articulação sinovial em corte, com cartilagem, cápsula, ligamento, tendão e músculos', 'Madhero88, Jmarchn · CC BY-SA 3.0 · rótulos traduzidos'),
    sarcomero: c('Sarcomere diagram.svg', 'Sarcômero com filamentos grossos e finos, linhas Z e M e bandas A e I', 'SlothMcCarty · CC BY-SA 3.0 · rótulos traduzidos'),
    pele: c('Diagram showing the structure of the skin CRUK 371.svg', 'Corte da pele com epiderme, derme e hipoderme, pelo, glândula sudorípara, nervo e vasos', 'Cancer Research UK · CC BY-SA 4.0 · rótulos traduzidos'),
    linfatico: c('Diagram of the lymphatic system CRUK 041.svg', 'Vasos linfáticos e linfonodos pelo corpo, com tonsilas, timo, baço e fígado identificados', 'Cancer Research UK · CC BY-SA 4.0 · rótulos traduzidos'),
    repfem: c('Scheme female reproductive system-pt.svg', 'Sistema reprodutor feminino em vista frontal: ovários, tubas uterinas, útero, cérvix, vagina e vulva', 'Mysid, Jmarchn · CC BY-SA 3.0'),
    repmasc: c('Human male reproductive system en.svg', 'Sistema reprodutor masculino em corte lateral, com testículo, epidídimo, ducto deferente, próstata e uretra', 'Wumingbai · CC BY-SA 4.0 · rótulos traduzidos'),
    niveis: c('Cos-huma-nivells-organitzacio-mut.svg', 'Níveis de organização do corpo, numerados de 1 a 7, do átomo ao organismo', 'LaiaMartínezM · CC BY-SA 4.0'),
  };
  for (const k in IMG) IMG[k].src = 'img/' + k + (IMG[k].file ? '.svg' : '.jpg');

  const LESSONS = {
    organizacao: {
      title: 'Organização do corpo e homeostase', short: 'Organização do corpo', dur: 20, hero: 'r-corpo',
      lead: 'Antes de estudar cada sistema, vale entender como o corpo se organiza e como mantém suas condições internas estáveis.',
      goals: ['Os níveis de organização, da célula ao organismo.', 'O que é homeostase e por que ela depende de vários sistemas.', 'Como funciona a retroalimentação negativa.'],
      secs: [
        { t: 'Introdução', h: 'Do que o corpo é feito, e como tudo isso funciona junto?', b: [
          { p: 'O corpo humano tem trilhões de células. Elas não trabalham isoladas: organizam-se em níveis cada vez mais complexos, e cada nível depende do anterior.' },
          { fig: 'r-corpo', cap: 'O corpo como conjunto de sistemas. No Atlas, cada sistema pode ser isolado e estudado.' },
          { p: 'Nesta aula você vai conhecer esses níveis e a ideia que une todos os sistemas: manter o meio interno em equilíbrio.' },
        ] },
        { t: 'Níveis de organização', h: 'Da célula ao organismo', b: [
          { p: 'Átomos formam moléculas, que formam células. Células semelhantes, com a mesma função, formam um tecido. Tecidos diferentes se combinam em um órgão, e órgãos que cooperam em uma função formam um sistema.' },
          { fig: 'niveis', cap: 'Níveis de organização: 1 átomo · 2 molécula · 3 célula · 4 tecido · 5 órgão · 6 sistema · 7 organismo.' },
          { cols: [['Tecido epitelial', 'Reveste superfícies e forma glândulas.'], ['Tecido conjuntivo', 'Sustenta, une e preenche. Inclui osso, cartilagem e sangue.'], ['Tecido muscular', 'Contrai e produz movimento.'], ['Tecido nervoso', 'Recebe estímulos e conduz impulsos.']] },
          { recall: ['O estômago é um tecido ou um órgão?', 'Um órgão. Sua parede reúne tecido epitelial, conjuntivo, muscular e nervoso trabalhando juntos.'] },
        ] },
        { t: 'Homeostase', h: 'Equilíbrio dinâmico do meio interno', b: [
          { p: 'Homeostase é a manutenção das condições internas, como temperatura, glicemia e quantidade de água, dentro de limites compatíveis com a vida. As variáveis oscilam o tempo todo; o que se mantém é a faixa de variação.' },
          { cols: [['Receptor', 'Detecta a alteração. Exemplo: sensores de temperatura na pele e no encéfalo.'], ['Centro de controle', 'Compara com o valor de referência e decide a resposta. Exemplo: hipotálamo.'], ['Efetor', 'Executa a resposta. Exemplo: glândulas sudoríparas e vasos da pele.']] },
          { p: 'Na retroalimentação negativa, a resposta se opõe à alteração que a provocou. Se a temperatura sobe, o corpo sua e dilata os vasos da pele, e a temperatura volta a cair.' },
          { warn: ['“Homeostase é quando nada muda no corpo.”', 'É o contrário: o corpo muda o tempo todo para corrigir desvios. Homeostase é um equilíbrio dinâmico, mantido por regulação constante.'] },
        ] },
        { t: 'Integração', h: 'Nenhum sistema mantém o equilíbrio sozinho', b: [
          { p: 'Os sistemas nervoso e endócrino coordenam as respostas. Os demais executam: o respiratório ajusta os gases, o urinário ajusta água e íons, o cardiovascular transporta tudo isso.' },
          { note: ['Exemplo aplicado', 'A retroalimentação positiva é rara e amplifica a alteração inicial, até um desfecho. É o caso das contrações do parto: quanto mais o útero contrai, mais ocitocina é liberada.'] },
          { recall: ['Tremer de frio é retroalimentação negativa ou positiva?', 'Negativa. A temperatura caiu, e o tremor produz calor, o que reduz o desvio.'] },
        ] },
      ],
      sint: {
        text: 'O corpo se organiza em níveis: células, tecidos, órgãos e sistemas. Todos os sistemas contribuem para a homeostase, o equilíbrio dinâmico do meio interno, mantido principalmente por retroalimentação negativa.',
        conf: [['Tecido × órgão', 'Tecido é um conjunto de células semelhantes. Órgão reúne tecidos diferentes.'], ['Retroalimentação negativa × positiva', 'A negativa reduz o desvio e estabiliza. A positiva amplia o desvio.'], ['Equilíbrio × imobilidade', 'Na homeostase as variáveis oscilam dentro de uma faixa; não ficam paradas.']],
        cards: [['Qual é a ordem dos níveis de organização?', 'Célula, tecido, órgão, sistema, organismo'], ['O que é homeostase?', 'A manutenção do meio interno dentro de limites compatíveis com a vida'], ['Quais são os três componentes de um mecanismo de regulação?', 'Receptor, centro de controle e efetor'], ['O que caracteriza a retroalimentação negativa?', 'A resposta se opõe à alteração que a provocou']],
      },
    },

    digestorio: {
      title: 'Sistema digestório', short: 'Digestório', dur: 30, hero: 'r-digestorio',
      lead: 'Transforma os alimentos em moléculas pequenas o bastante para entrar no sangue e chegar a todas as células.',
      goals: ['O caminho do alimento, da boca ao ânus.', 'A diferença entre digestão mecânica e química.', 'Onde e como os nutrientes são absorvidos.'],
      secs: [
        { t: 'Introdução', h: 'Como um pedaço de pão vira energia para as suas células?', b: [
          { p: 'As células não conseguem usar o alimento como ele chega ao prato. Amido, proteínas e gorduras são moléculas grandes, que precisam ser quebradas em partes menores antes de atravessar a parede do intestino.' },
          { fig: 'r-digestorio', cap: 'O tubo digestório percorre o tronco. Fígado e pâncreas são glândulas anexas.' },
          { p: 'O sistema digestório faz quatro coisas: ingere, digere, absorve e elimina o que não foi aproveitado.' },
        ] },
        { t: 'Estruturas', h: 'Tubo digestório e glândulas anexas', b: [
          { p: 'O tubo digestório é um caminho contínuo: boca, faringe, esôfago, estômago, intestino delgado, intestino grosso e ânus. Glândulas salivares, fígado e pâncreas ficam fora do tubo e lançam nele suas secreções.' },
          { fig: 'digestorio', cap: 'Órgãos do sistema digestório. O intestino delgado tem três partes: duodeno, jejuno e íleo.' },
          { cols: [['Estômago', 'Armazena, mistura e inicia a digestão das proteínas em meio ácido.'], ['Fígado', 'Produz a bile, armazenada na vesícula biliar.'], ['Pâncreas', 'Produz o suco pancreático, com enzimas para carboidratos, proteínas e gorduras.']] },
          { recall: ['O alimento passa por dentro do fígado?', 'Não. O fígado é uma glândula anexa: lança a bile no duodeno, mas o alimento não passa por ele.'] },
        ] },
        { t: 'Digestão e absorção', h: 'Quebrar para poder absorver', b: [
          { p: 'A digestão mecânica fragmenta o alimento: mastigação e movimentos do estômago. A digestão química quebra as moléculas com enzimas. O peristaltismo, contrações da parede do tubo, empurra o conteúdo adiante.' },
          { cols: [['Boca', 'A amilase salivar começa a digerir o amido.'], ['Estômago', 'A pepsina, ativada pelo ácido clorídrico, começa a digerir as proteínas.'], ['Intestino delgado', 'Bile emulsifica as gorduras; enzimas do pâncreas e do intestino completam a digestão.']] },
          { p: 'A maior parte da absorção ocorre no intestino delgado. Sua parede tem dobras, vilosidades e microvilosidades, que ampliam muito a superfície de contato. O intestino grosso absorve água e sais e forma as fezes.' },
          { warn: ['“A bile digere as gorduras.”', 'A bile não tem enzimas. Ela emulsifica: divide a gordura em gotículas e facilita a ação das lipases, que fazem a digestão química.'] },
        ] },
        { t: 'Integração', h: 'Do intestino para o corpo inteiro', b: [
          { p: 'Glicose e aminoácidos entram nos capilares das vilosidades e seguem pelo sangue até o fígado, que regula sua distribuição. Parte das gorduras segue pelos vasos linfáticos.' },
          { cols: [['Cardiovascular', 'Transporta os nutrientes absorvidos até os tecidos.'], ['Endócrino', 'Insulina e glucagon regulam a glicose no sangue após as refeições.'], ['Nervoso', 'Controla a salivação, os movimentos e as secreções do tubo.']] },
          { recall: ['Por que as vilosidades são importantes?', 'Porque aumentam a superfície do intestino delgado, o que torna a absorção muito mais eficiente.'] },
        ] },
      ],
      sint: {
        text: 'O alimento percorre o tubo digestório e é quebrado por ação mecânica e por enzimas. A absorção ocorre principalmente no intestino delgado, e os nutrientes seguem pelo sangue até as células.',
        conf: [['Digestão × absorção', 'Digestão é quebrar as moléculas. Absorção é a passagem delas para o sangue.'], ['Intestino delgado × grosso', 'O delgado absorve a maior parte dos nutrientes. O grosso absorve água e sais.'], ['Bile × enzima', 'A bile emulsifica gorduras; não é enzima e não faz digestão química.']],
        cards: [['Onde começa a digestão do amido?', 'Na boca, pela amilase salivar'], ['Que enzima inicia a digestão das proteínas no estômago?', 'A pepsina, em meio ácido'], ['Qual é a função da bile?', 'Emulsificar as gorduras, facilitando a ação das lipases'], ['Onde ocorre a maior parte da absorção de nutrientes?', 'No intestino delgado, pelas vilosidades']],
      },
    },

    respiratorio: {
      title: 'Sistema respiratório', short: 'Respiratório', dur: 30, hero: 'r-respiratorio',
      lead: 'Leva o ar até os alvéolos, onde o sangue recebe oxigênio e libera gás carbônico.',
      goals: ['O caminho do ar, do nariz aos alvéolos.', 'Como o diafragma faz o ar entrar e sair.', 'Como os gases passam entre o ar e o sangue.'],
      secs: [
        { t: 'Introdução', h: 'Por que você não consegue ficar sem respirar?', b: [
          { p: 'As células usam oxigênio para obter energia dos nutrientes e produzem gás carbônico, que precisa ser eliminado. Sem troca constante desses gases, as células param de funcionar em poucos minutos.' },
          { fig: 'r-respiratorio', cap: 'Traqueia e pulmões ocupam boa parte do tórax, protegidos pela caixa torácica.' },
          { p: 'Atenção aos nomes: respirar, no sentido de ventilar os pulmões, é diferente da respiração celular, que ocorre dentro de cada célula.' },
        ] },
        { t: 'Estruturas', h: 'Vias respiratórias e pulmões', b: [
          { p: 'O ar entra pelo nariz, onde é filtrado, aquecido e umedecido. Segue pela faringe, laringe e traqueia, que se divide em dois brônquios. Dentro dos pulmões, os brônquios se ramificam em bronquíolos, que terminam nos alvéolos.' },
          { fig: 'respiratorio', cap: 'Visão geral do sistema respiratório. O diafragma separa o tórax do abdome.' },
          { fig: 'alveolo', cap: 'Sacos alveolares envolvidos por uma rede de capilares. É aqui que ocorrem as trocas gasosas.' },
          { recall: ['Qual estrutura das vias respiratórias abriga as pregas vocais?', 'A laringe.'] },
        ] },
        { t: 'Ventilação e trocas', h: 'O ar entra por diferença de pressão; os gases passam por difusão', b: [
          { p: 'Na inspiração, o diafragma contrai e desce, e os músculos intercostais elevam as costelas. O volume do tórax aumenta, a pressão interna cai e o ar entra. Na expiração em repouso, esses músculos relaxam e o ar sai.' },
          { p: 'Nos alvéolos ocorre a hematose. O oxigênio está mais concentrado no ar alveolar do que no sangue que chega, então passa para o sangue por difusão. O gás carbônico faz o caminho inverso.' },
          { note: ['No modelo ao lado', 'A ampliação mostra um alvéolo envolto por capilares. Repare que as cores se invertem em relação ao resto do corpo: o sangue chega azul, pobre em O₂, pela artéria pulmonar, e sai vermelho, rico em O₂, pela veia pulmonar.'] },
          { cols: [['Oxigênio', 'É transportado quase todo ligado à hemoglobina das hemácias.'], ['Gás carbônico', 'Viaja principalmente dissolvido no plasma, na forma de bicarbonato.']] },
          { warn: ['“Os pulmões puxam o ar porque são músculos.”', 'Os pulmões não têm músculos que os movam. Quem altera o volume do tórax são o diafragma e os músculos intercostais.'] },
        ] },
        { t: 'Integração', h: 'Respirar é um trabalho de equipe', b: [
          { p: 'O sangue que sai dos pulmões, rico em oxigênio, volta ao coração e é distribuído ao corpo. Por isso os sistemas respiratório e cardiovascular respondem juntos quando a demanda muda.' },
          { cols: [['Cardiovascular', 'A circulação pulmonar leva o sangue aos alvéolos e o traz de volta.'], ['Nervoso', 'O bulbo ajusta o ritmo da respiração conforme o gás carbônico no sangue.'], ['Muscular', 'Diafragma e intercostais produzem os movimentos da ventilação.']] },
          { recall: ['No exercício, o que faz a respiração acelerar?', 'O aumento de gás carbônico no sangue, detectado pelo sistema nervoso.'] },
        ] },
      ],
      sint: {
        text: 'O ar chega aos alvéolos por diferença de pressão criada pelo diafragma e pelos intercostais. Nos alvéolos, oxigênio e gás carbônico atravessam por difusão entre o ar e o sangue.',
        conf: [['Ventilação × respiração celular', 'Ventilar é renovar o ar dos pulmões. Respiração celular é obter energia dentro da célula.'], ['Inspiração × expiração', 'Na inspiração o diafragma contrai e desce. Na expiração ele relaxa e sobe.'], ['Hematose × transporte', 'Hematose é a troca nos alvéolos. O transporte é feito pelo sangue.']],
        cards: [['Onde ocorrem as trocas gasosas?', 'Nos alvéolos pulmonares'], ['O que o diafragma faz na inspiração?', 'Contrai e desce, aumentando o volume do tórax'], ['Por qual processo o oxigênio passa do ar para o sangue?', 'Difusão, do local mais concentrado para o menos concentrado'], ['Como a maior parte do oxigênio é transportada no sangue?', 'Ligada à hemoglobina das hemácias']],
      },
    },

    urinario: {
      title: 'Sistema urinário', short: 'Urinário', dur: 30, hero: 'r-urinario',
      lead: 'Filtra o sangue, elimina resíduos e ajusta a quantidade de água e de íons do corpo.',
      goals: ['Os órgãos do sistema e o caminho da urina.', 'As etapas de formação da urina no néfron.', 'Como os rins ajudam a manter o equilíbrio hídrico.'],
      secs: [
        { t: 'Introdução', h: 'Para onde vão os resíduos que as células produzem?', b: [
          { p: 'Você viu como o sangue transporta substâncias. Entre elas estão resíduos do metabolismo, como a ureia, que em excesso são tóxicos. Os rins retiram esses resíduos do sangue e, ao mesmo tempo, decidem quanta água e quantos íons o corpo deve conservar.' },
          { fig: 'r-urinario', cap: 'Rins, ureteres e bexiga. Os rins ficam na parte posterior do abdome.' },
        ] },
        { t: 'Estruturas', h: 'Rins e vias urinárias', b: [
          { p: 'A urina é formada nos rins, desce pelos ureteres, fica armazenada na bexiga e sai pela uretra. Cada rim recebe sangue pela artéria renal e o devolve pela veia renal.' },
          { fig: 'urinario', cap: '1 sistema urinário · 2 rim · 3 pelve renal · 4 ureter · 5 bexiga urinária · 6 uretra · 7 glândula suprarrenal · 8 artéria e veia renais · 9 veia cava inferior · 10 aorta abdominal · 11 artéria e veia ilíacas comuns · 12 fígado · 13 intestino grosso · 14 pelve.' },
          { recall: ['Qual é a diferença entre ureter e uretra?', 'O ureter leva a urina do rim à bexiga. A uretra leva a urina da bexiga para fora do corpo.'] },
        ] },
        { t: 'Formação da urina', h: 'O néfron filtra, recupera e ajusta', b: [
          { p: 'Cada rim tem cerca de um milhão de néfrons. No glomérulo, a pressão do sangue força a passagem de água e pequenas moléculas para a cápsula de Bowman: é a filtração. Células do sangue e proteínas grandes não passam.' },
          { fig: 'nefron', cap: '1 artéria interlobular · 2 arteríola aferente · 3 aparelho justaglomerular · 4 corpúsculo renal · 5 glomérulo · 6 cápsula de Bowman · 7 arteríola eferente · 8 túbulo contorcido proximal · 9 alça de Henle · 10 túbulo contorcido distal · 11 ducto coletor · 12 veia interlobular.' },
          { cols: [['Filtração', 'Do sangue para o néfron: água, sais, glicose, ureia.'], ['Reabsorção', 'Do néfron de volta ao sangue: quase toda a água, a glicose e parte dos sais.'], ['Secreção', 'Do sangue para o néfron: substâncias que ainda precisam ser eliminadas.']] },
          { warn: ['“Tudo o que é filtrado vira urina.”', 'Os rins filtram cerca de 180 litros por dia, mas eliminam perto de 1,5 litro. Quase tudo é reabsorvido.'] },
        ] },
        { t: 'Integração', h: 'Água na medida certa', b: [
          { p: 'Quando falta água, o hipotálamo percebe o sangue mais concentrado e a hipófise libera o hormônio antidiurético (ADH). Ele aumenta a reabsorção de água nos rins: a urina fica mais concentrada e em menor volume.' },
          { cols: [['Cardiovascular', 'Leva o sangue aos rins; o volume de líquido influencia a pressão arterial.'], ['Endócrino', 'ADH e aldosterona ajustam a reabsorção de água e de sódio.'], ['Nervoso', 'Gera a sensação de sede e controla o esvaziamento da bexiga.']] },
          { recall: ['Depois de beber muita água, a urina fica mais clara. Por quê?', 'A liberação de ADH diminui, os rins reabsorvem menos água e a urina sai mais diluída.'] },
        ] },
      ],
      sint: {
        text: 'Os rins filtram o sangue nos néfrons, reabsorvem o que o corpo precisa e eliminam o restante como urina, que segue por ureteres, bexiga e uretra. Hormônios como o ADH ajustam quanta água é conservada.',
        conf: [['Ureter × uretra', 'Ureter: do rim à bexiga. Uretra: da bexiga para fora.'], ['Filtração × reabsorção', 'Filtrar é passar do sangue para o néfron. Reabsorver é devolver ao sangue.'], ['Excreção × defecação', 'A urina elimina resíduos do metabolismo. As fezes eliminam o que não foi absorvido.']],
        cards: [['Qual é a unidade funcional do rim?', 'O néfron'], ['Qual é o trajeto da urina?', 'Rim, ureter, bexiga, uretra'], ['Quais são as três etapas da formação da urina?', 'Filtração, reabsorção e secreção'], ['O que o ADH faz?', 'Aumenta a reabsorção de água nos rins, concentrando a urina']],
      },
    },

    nervoso: {
      title: 'Sistema nervoso', short: 'Nervoso', dur: 35, hero: 'r-nervoso',
      lead: 'Recebe estímulos, integra informações e coordena respostas rápidas em todo o corpo.',
      goals: ['As partes do neurônio e o sentido do impulso.', 'A divisão em sistema nervoso central e periférico.', 'Como funciona um arco reflexo.'],
      secs: [
        { t: 'Introdução', h: 'Como você tira a mão do fogo antes de sentir a dor?', b: [
          { p: 'O sistema nervoso é a rede de comunicação mais rápida do corpo. Ele capta o que acontece dentro e fora do organismo, interpreta e comanda músculos e glândulas em frações de segundo.' },
          { fig: 'r-nervoso', cap: 'O encéfalo, protegido pelo crânio, é o principal centro de integração.' },
        ] },
        { t: 'Neurônio', h: 'A célula que conduz impulsos', b: [
          { p: 'O neurônio tem três partes: dendritos, que recebem os sinais; corpo celular, onde fica o núcleo; e axônio, que conduz o impulso até a célula seguinte. O impulso segue sempre nesse sentido.' },
          { fig: 'neuronio', cap: 'Neurônio e sinapse. A bainha de mielina envolve o axônio e acelera a condução do impulso.' },
          { p: 'Entre um neurônio e outro há um pequeno espaço, a sinapse. Ali o sinal elétrico vira sinal químico: o axônio libera neurotransmissores, que atravessam a fenda e estimulam a célula seguinte.' },
          { recall: ['O impulso nervoso passa de um neurônio a outro por contato direto?', 'Não. Na maioria das sinapses, neurotransmissores atravessam a fenda sináptica.'] },
        ] },
        { t: 'Organização', h: 'Central e periférico', b: [
          { cols: [['Sistema nervoso central', 'Encéfalo e medula espinal. Integra as informações e elabora as respostas.'], ['Sistema nervoso periférico', 'Nervos e gânglios. Liga o sistema nervoso central ao restante do corpo.']] },
          { p: 'No encéfalo, o cérebro responde pela percepção, pelo pensamento e pelos movimentos voluntários; o cerebelo coordena o equilíbrio e a precisão dos movimentos; e o bulbo controla funções vitais, como a respiração e os batimentos do coração.' },
          { p: 'Neurônios sensitivos levam informações dos receptores ao sistema nervoso central. Neurônios motores levam os comandos até músculos e glândulas. A parte autônoma controla funções involuntárias, como batimentos do coração e digestão.' },
          { warn: ['“Medula espinal e medula óssea são a mesma coisa.”', 'A medula espinal é tecido nervoso, dentro da coluna vertebral. A medula óssea fica dentro dos ossos e produz células do sangue.'] },
        ] },
        { t: 'Reflexos e integração', h: 'Respostas que não esperam pelo cérebro', b: [
          { p: 'No arco reflexo, o estímulo segue pelo neurônio sensitivo até a medula espinal, que aciona diretamente o neurônio motor. A resposta acontece antes de a informação chegar ao cérebro, e é por isso que a dor é percebida depois.' },
          { fig: 'reflexo', cap: 'Arco reflexo de retirada: receptor, neurônio aferente (sensitivo), medula espinal, neurônio eferente (motor) e músculo efetor.' },
          { cols: [['Endócrino', 'O hipotálamo liga os dois sistemas e comanda a hipófise.'], ['Muscular', 'Toda contração voluntária depende de um neurônio motor.'], ['Sentidos', 'Olhos, ouvidos, pele, língua e nariz têm receptores que alimentam o sistema nervoso.']] },
        ] },
      ],
      sint: {
        text: 'Neurônios conduzem impulsos dos dendritos ao axônio e se comunicam por sinapses. O sistema nervoso central integra as informações, e o periférico as leva e traz. Reflexos são respostas rápidas integradas na medula espinal.',
        conf: [['Central × periférico', 'Central: encéfalo e medula espinal. Periférico: nervos e gânglios.'], ['Sensitivo × motor', 'O sensitivo leva a informação ao centro. O motor leva o comando ao efetor.'], ['Nervoso × endócrino', 'O nervoso é rápido e de curta duração. O endócrino é mais lento e duradouro.']],
        cards: [['Qual é o sentido do impulso no neurônio?', 'Dendritos, corpo celular, axônio'], ['O que é a sinapse?', 'A região de comunicação entre um neurônio e a célula seguinte'], ['Quais órgãos formam o sistema nervoso central?', 'Encéfalo e medula espinal'], ['Onde é integrada a resposta de um reflexo de retirada?', 'Na medula espinal']],
      },
    },

    endocrino: {
      title: 'Sistema endócrino', short: 'Endócrino', dur: 30, hero: 'r-endocrino',
      lead: 'Glândulas liberam hormônios no sangue e regulam o corpo por sinalização química.',
      goals: ['O que é um hormônio e como ele encontra seu alvo.', 'As principais glândulas e seus hormônios.', 'Como insulina e glucagon regulam a glicemia.'],
      secs: [
        { t: 'Introdução', h: 'Como uma glândula no pescoço influencia o corpo inteiro?', b: [
          { p: 'Hormônios são mensageiros químicos. As glândulas endócrinas os liberam diretamente no sangue, que os leva a todo o corpo. Só respondem as células-alvo, aquelas que têm receptores para aquele hormônio.' },
          { fig: 'r-endocrino', cap: 'As glândulas suprarrenais ficam sobre os rins. No modelo do Atlas, o sistema endócrino inclui também hipófise e glândula pineal.' },
          { p: 'Comparada à sinalização nervosa, a hormonal é mais lenta para começar, mas seus efeitos duram mais.' },
        ] },
        { t: 'Glândulas', h: 'Quem produz o quê', b: [
          { fig: 'endocrino', cap: 'Principais glândulas endócrinas. Ovários e testículos também produzem hormônios.' },
          { cols: [['Hipófise', 'Comandada pelo hipotálamo, regula outras glândulas. Libera hormônio do crescimento, TSH, ADH, entre outros.'], ['Tireoide', 'T3 e T4 regulam o ritmo do metabolismo.'], ['Pâncreas', 'Insulina e glucagon regulam a glicose no sangue.'], ['Suprarrenais', 'Adrenalina prepara o corpo para reagir; cortisol atua no estresse prolongado.']] },
          { recall: ['Por que um hormônio age só em algumas células, se viaja por todo o sangue?', 'Porque só as células-alvo têm receptores específicos para ele.'] },
        ] },
        { t: 'Regulação da glicemia', h: 'Dois hormônios, efeitos opostos', b: [
          { p: 'Depois de uma refeição, a glicose no sangue sobe. As células beta do pâncreas liberam insulina, que favorece a entrada de glicose nas células e seu armazenamento no fígado como glicogênio. A glicemia cai.' },
          { fig: 'glicemia', cap: 'Insulina reduz a glicemia; glucagon a eleva. Os dois mantêm a glicose do sangue dentro de uma faixa estreita.' },
          { p: 'No jejum, a glicemia cai. As células alfa liberam glucagon, que faz o fígado quebrar glicogênio e liberar glicose. É um exemplo de retroalimentação negativa.' },
          { warn: ['“Insulina e glucagon fazem a mesma coisa.”', 'São antagonistas. A insulina reduz a glicose do sangue; o glucagon a aumenta.'] },
        ] },
        { t: 'Integração', h: 'Sistema nervoso e endócrino trabalham juntos', b: [
          { p: 'O hipotálamo, parte do encéfalo, produz hormônios que controlam a hipófise. Assim, informações captadas pelo sistema nervoso viram respostas hormonais.' },
          { cols: [['Urinário', 'O ADH aumenta a reabsorção de água nos rins.'], ['Reprodutor', 'FSH e LH, da hipófise, regulam ovários e testículos.'], ['Digestório', 'Insulina e glucagon respondem à glicose absorvida no intestino.']] },
          { note: ['Exemplo aplicado', 'No diabetes melito, a insulina falta ou não age bem. A glicose se acumula no sangue e pode aparecer na urina.'] },
        ] },
      ],
      sint: {
        text: 'Glândulas endócrinas liberam hormônios no sangue, e apenas as células-alvo respondem. A hipófise, comandada pelo hipotálamo, regula outras glândulas. Insulina e glucagon mantêm a glicemia por retroalimentação negativa.',
        conf: [['Endócrina × exócrina', 'A endócrina lança hormônios no sangue. A exócrina lança sua secreção por ductos.'], ['Insulina × glucagon', 'Insulina reduz a glicemia. Glucagon aumenta.'], ['Hormônio × neurotransmissor', 'O hormônio viaja pelo sangue. O neurotransmissor age na sinapse.']],
        cards: [['Como os hormônios chegam às células-alvo?', 'Pela corrente sanguínea'], ['Qual hormônio reduz a glicose no sangue?', 'A insulina'], ['Que estrutura do encéfalo comanda a hipófise?', 'O hipotálamo'], ['O que a tireoide regula?', 'O ritmo do metabolismo, por meio de T3 e T4']],
      },
    },

    esqueletico: {
      title: 'Sistema esquelético', short: 'Esquelético', dur: 25, hero: 'r-esqueletico',
      lead: 'Sustenta o corpo, protege órgãos, serve de alavanca para os músculos e abriga a medula óssea.',
      goals: ['As funções dos ossos além da sustentação.', 'A divisão do esqueleto em axial e apendicular.', 'Como é formada uma articulação móvel.'],
      secs: [
        { t: 'Introdução', h: 'Osso é uma estrutura viva?', b: [
          { p: 'Sim. O osso é um tecido vivo, com células, vasos e nervos. Ele se renova ao longo da vida, repara fraturas e responde ao esforço. O esqueleto adulto tem 206 ossos.' },
          { fig: 'r-esqueletico', cap: 'Esqueleto em vista frontal. No Atlas, cada osso pode ser selecionado.' },
          { cols: [['Sustentação e proteção', 'Crânio protege o encéfalo; caixa torácica protege coração e pulmões.'], ['Movimento', 'Os ossos funcionam como alavancas movidas pelos músculos.'], ['Reserva e produção', 'Armazenam cálcio e abrigam a medula óssea vermelha, que produz células do sangue.']] },
        ] },
        { t: 'Organização', h: 'Esqueleto axial e apendicular', b: [
          { p: 'O esqueleto axial forma o eixo do corpo: crânio, coluna vertebral e caixa torácica. O apendicular reúne os ossos dos membros e as cinturas que os ligam ao eixo: a escapular, nos ombros, e a pélvica, nos quadris.' },
          { fig: 'esqueleto', cap: 'Em azul, o esqueleto axial. O restante forma o esqueleto apendicular.' },
          { recall: ['O fêmur pertence ao esqueleto axial ou ao apendicular?', 'Ao apendicular: é um osso do membro inferior.'] },
        ] },
        { t: 'Articulações', h: 'Onde os ossos se encontram', b: [
          { p: 'Articulação é a união entre dois ou mais ossos. Algumas são imóveis, como as suturas do crânio. As articulações sinoviais, como joelho e cotovelo, permitem movimentos amplos.' },
          { fig: 'articulacao', cap: 'Articulação sinovial em corte. A cartilagem reveste as extremidades dos ossos, e o líquido sinovial reduz o atrito.' },
          { warn: ['“Tendão e ligamento são a mesma coisa.”', 'O ligamento une osso a osso e estabiliza a articulação. O tendão une músculo a osso e transmite a força da contração.'] },
        ] },
        { t: 'Integração', h: 'O esqueleto não se move sozinho', b: [
          { p: 'O movimento resulta da ação conjunta de ossos, articulações e músculos, sob comando do sistema nervoso. Os ossos também participam do equilíbrio do cálcio no sangue.' },
          { cols: [['Muscular', 'Músculos se prendem aos ossos por tendões e os movem.'], ['Cardiovascular', 'A medula óssea vermelha produz hemácias, leucócitos e plaquetas.'], ['Endócrino', 'Hormônios regulam o crescimento dos ossos e a troca de cálcio com o sangue.']] },
          { recall: ['Onde são produzidas as células do sangue?', 'Na medula óssea vermelha, no interior de alguns ossos.'] },
        ] },
      ],
      sint: {
        text: 'O esqueleto sustenta, protege, permite o movimento, armazena cálcio e produz células do sangue. Divide-se em axial e apendicular, e seus ossos se unem por articulações.',
        conf: [['Tendão × ligamento', 'Tendão: músculo a osso. Ligamento: osso a osso.'], ['Medula óssea × medula espinal', 'A óssea produz células do sangue. A espinal é tecido nervoso.'], ['Axial × apendicular', 'Axial: crânio, coluna e caixa torácica. Apendicular: membros e cinturas.']],
        cards: [['Quais ossos formam o esqueleto axial?', 'Crânio, coluna vertebral e caixa torácica'], ['O que une um osso a outro em uma articulação?', 'Os ligamentos'], ['Onde ocorre a produção das células do sangue?', 'Na medula óssea vermelha'], ['Qual é a função da cartilagem articular?', 'Revestir as extremidades dos ossos e reduzir o atrito']],
      },
    },

    muscular: {
      title: 'Sistema muscular', short: 'Muscular', dur: 25, hero: 'r-muscular',
      lead: 'Músculos se contraem e produzem movimento, postura e calor.',
      goals: ['Os três tipos de tecido muscular.', 'Como os filamentos deslizam na contração.', 'Por que os músculos trabalham em pares.'],
      secs: [
        { t: 'Introdução', h: 'O que acontece dentro do músculo quando você dobra o braço?', b: [
          { p: 'Todo movimento do corpo, de piscar a correr, depende de células capazes de encurtar: as fibras musculares. Ao contrair, elas também produzem calor, o que ajuda a manter a temperatura corporal.' },
          { fig: 'r-muscular', cap: 'Musculatura esquelética em vista frontal. São mais de 600 músculos.' },
        ] },
        { t: 'Tipos de tecido', h: 'Três tecidos, três trabalhos', b: [
          { cols: [['Estriado esquelético', 'Preso aos ossos. Contração voluntária e rápida.'], ['Estriado cardíaco', 'Forma o coração. Contração involuntária e ritmada.'], ['Liso', 'Na parede de vísceras e vasos. Contração involuntária e lenta.']] },
          { p: 'Estriado quer dizer que, ao microscópio, as fibras mostram faixas transversais. Elas aparecem porque os filamentos de proteína estão organizados em unidades repetidas, os sarcômeros.' },
          { recall: ['O músculo da parede do estômago é de que tipo?', 'Liso, de contração involuntária.'] },
        ] },
        { t: 'Contração', h: 'Filamentos que deslizam', b: [
          { p: 'Cada sarcômero tem filamentos finos, de actina, e filamentos grossos, de miosina. Na contração, a miosina puxa a actina em direção ao centro. Os filamentos não encurtam: eles deslizam uns sobre os outros, e o sarcômero fica menor.' },
          { fig: 'sarcomero', cap: 'Sarcômero, a unidade de contração. Ao contrair, as linhas Z se aproximam.' },
          { p: 'Esse deslizamento consome ATP e depende de íons cálcio, liberados quando o impulso de um neurônio motor chega à fibra.' },
          { warn: ['“O músculo empurra o osso.”', 'Músculos só puxam. Para o movimento contrário, outro músculo, do lado oposto, precisa contrair.'] },
        ] },
        { t: 'Integração', h: 'Pares que se opõem', b: [
          { p: 'Como músculos só puxam, eles atuam em pares antagonistas. Para dobrar o cotovelo, o bíceps contrai e o tríceps relaxa. Para estender, é o inverso.' },
          { cols: [['Esquelético', 'Os ossos são as alavancas; os tendões transmitem a força.'], ['Nervoso', 'Neurônios motores disparam cada contração voluntária.'], ['Cardiovascular e respiratório', 'Fornecem o oxigênio e a glicose usados para produzir ATP.']] },
          { recall: ['Qual é a fonte imediata de energia para a contração muscular?', 'O ATP.'] },
        ] },
      ],
      sint: {
        text: 'Há três tipos de tecido muscular: esquelético, cardíaco e liso. A contração ocorre pelo deslizamento de actina e miosina no sarcômero, com gasto de ATP. Músculos esqueléticos atuam em pares antagonistas.',
        conf: [['Voluntário × involuntário', 'O esquelético é voluntário. Cardíaco e liso são involuntários.'], ['Actina × miosina', 'Actina forma os filamentos finos. Miosina forma os grossos.'], ['Antagonista × sinergista', 'Antagonistas fazem movimentos opostos. Sinergistas atuam juntos.']],
        cards: [['Quais são os três tipos de tecido muscular?', 'Estriado esquelético, estriado cardíaco e liso'], ['O que é o sarcômero?', 'A unidade de contração da fibra muscular estriada'], ['Que proteínas formam os filamentos do sarcômero?', 'Actina, nos finos, e miosina, nos grossos'], ['Por que bíceps e tríceps são antagonistas?', 'Porque produzem movimentos opostos na mesma articulação']],
      },
    },

    tegumentar: {
      title: 'Sistema tegumentar', short: 'Tegumentar', dur: 20, hero: 'r-tegumentar',
      lead: 'Pele e anexos formam a barreira do corpo, ajudam a regular a temperatura e percebem o ambiente.',
      goals: ['As camadas da pele e o que há em cada uma.', 'Como a pele participa da regulação térmica.', 'O papel da pele como barreira de defesa.'],
      secs: [
        { t: 'Introdução', h: 'Qual é o maior órgão do corpo?', b: [
          { p: 'A pele. Em um adulto, ela cobre cerca de 2 m² e é a fronteira entre o organismo e o ambiente. Com seus anexos, que são pelos, unhas e glândulas, forma o sistema tegumentar.' },
          { fig: 'r-tegumentar', cap: 'A pele reveste toda a superfície do corpo.' },
        ] },
        { t: 'Camadas da pele', h: 'Epiderme, derme e hipoderme', b: [
          { fig: 'pele', cap: 'Corte da pele. A epiderme não tem vasos; ela é nutrida a partir da derme.' },
          { cols: [['Epiderme', 'Camada superficial, de tecido epitelial. Suas células produzem queratina, que impermeabiliza, e melanina, que protege da radiação ultravioleta.'], ['Derme', 'Tecido conjuntivo com vasos, nervos, glândulas e a raiz dos pelos.'], ['Hipoderme', 'Camada profunda, rica em gordura. Isola e amortece. Nem sempre é contada como parte da pele.']] },
          { recall: ['Por que um arranhão bem superficial não sangra?', 'Porque atinge só a epiderme, que não tem vasos sanguíneos.'] },
        ] },
        { t: 'Funções', h: 'Barreira, termostato e sensor', b: [
          { p: 'No calor, as glândulas sudoríparas produzem suor, e sua evaporação retira calor da pele. Os vasos da derme se dilatam e perdem mais calor para o ambiente. No frio, eles se contraem e conservam calor.' },
          { p: 'A pele também abriga receptores de tato, pressão, temperatura e dor, e inicia a produção de vitamina D quando exposta ao sol.' },
          { warn: ['“O suor esfria o corpo só por sair da pele.”', 'O que resfria é a evaporação do suor. Em ambiente muito úmido, o suor evapora mal e o resfriamento é menor.'] },
        ] },
        { t: 'Integração', h: 'A primeira linha de defesa', b: [
          { p: 'A pele íntegra impede a entrada da maioria dos microrganismos. Quando há um corte, a barreira se rompe e o sistema imunitário é acionado.' },
          { cols: [['Imunidade', 'A pele é uma barreira física e química contra microrganismos.'], ['Nervoso', 'Recebe as informações dos receptores da pele.'], ['Cardiovascular', 'O fluxo de sangue na derme ajusta a perda de calor.']] },
          { recall: ['Qual pigmento protege a pele contra a radiação ultravioleta?', 'A melanina, produzida pelos melanócitos da epiderme.'] },
        ] },
      ],
      sint: {
        text: 'A pele tem epiderme, sem vasos, e derme, com vasos, nervos e glândulas, apoiadas na hipoderme. Protege contra microrganismos e radiação, participa da regulação térmica e percebe estímulos.',
        conf: [['Epiderme × derme', 'A epiderme é epitelial e sem vasos. A derme é conjuntiva e vascularizada.'], ['Queratina × melanina', 'A queratina impermeabiliza e dá resistência. A melanina protege da radiação ultravioleta.'], ['Suar × resfriar', 'O resfriamento vem da evaporação do suor, não da sua produção.']],
        cards: [['Quais são as camadas da pele?', 'Epiderme e derme, sobre a hipoderme'], ['Como o suor resfria o corpo?', 'Ao evaporar, retira calor da superfície da pele'], ['Qual é a função da melanina?', 'Proteger as células contra a radiação ultravioleta'], ['Que proteína impermeabiliza a epiderme?', 'A queratina']],
      },
    },

    linfatico: {
      title: 'Sistema linfático e imunidade', short: 'Linfático e imunidade', dur: 30, hero: 'r-linfatico',
      lead: 'Drena o líquido dos tecidos de volta ao sangue e abriga as células que defendem o organismo.',
      goals: ['O que é a linfa e por onde ela circula.', 'O papel de linfonodos, baço e timo.', 'A diferença entre imunidade inata e adaptativa, e como as vacinas atuam.'],
      secs: [
        { t: 'Introdução', h: 'Por que aparecem “ínguas” quando você tem uma infecção?', b: [
          { p: 'As ínguas são linfonodos aumentados. Eles incham porque ali as células de defesa estão se multiplicando para combater os microrganismos trazidos pela linfa.' },
          { fig: 'r-linfatico', cap: 'Timo, no tórax, e baço, no abdome. No modelo do Atlas, linfonodos e vasos linfáticos não estão incluídos.' },
        ] },
        { t: 'Anatomia linfática', h: 'Uma rede de drenagem', b: [
          { p: 'Nos capilares sanguíneos, parte do plasma sai para os tecidos. O excesso desse líquido entra nos vasos linfáticos e passa a se chamar linfa. Ela segue em sentido único e desemboca em veias próximas ao coração.' },
          { fig: 'linfatico', cap: 'Vasos linfáticos e linfonodos, em verde, com tonsilas, timo, baço e fígado.' },
          { cols: [['Linfonodos', 'Filtram a linfa e reúnem linfócitos.'], ['Baço', 'Filtra o sangue e remove hemácias envelhecidas.'], ['Timo', 'Local de maturação dos linfócitos T.'], ['Tonsilas', 'Defesa na entrada das vias respiratórias e digestórias.']] },
          { recall: ['A linfa circula nos dois sentidos, como o sangue?', 'Não. Ela segue em sentido único, dos tecidos em direção ao coração.'] },
        ] },
        { t: 'Imunidade', h: 'Defesa geral e defesa específica', b: [
          { cols: [['Imunidade inata', 'Já nasce pronta e age rápido contra qualquer invasor: pele, mucosas, fagócitos, inflamação.'], ['Imunidade adaptativa', 'Demora alguns dias, mas é específica e guarda memória: linfócitos B e T.']] },
          { p: 'Antígeno é qualquer molécula que o sistema imunitário reconhece como estranha. Linfócitos B produzem anticorpos, que se ligam ao antígeno. Linfócitos T coordenam a resposta e destroem células infectadas. Parte dessas células vira células de memória.' },
          { p: 'A vacina apresenta antígenos sem causar a doença. O corpo responde e forma memória. Em um contato futuro com o agente real, a resposta é mais rápida e mais intensa.' },
          { warn: ['“Vacina e soro são a mesma coisa.”', 'A vacina estimula o corpo a produzir seus próprios anticorpos e memória: previne. O soro traz anticorpos prontos, de efeito imediato e temporário: trata.'] },
        ] },
        { t: 'Integração', h: 'Defesa ligada à circulação', b: [
          { p: 'O sistema linfático devolve ao sangue cerca de 3 litros de líquido por dia. Sem essa drenagem, o líquido se acumula nos tecidos e forma edema.' },
          { cols: [['Cardiovascular', 'A linfa volta ao sangue; leucócitos circulam pelos dois sistemas.'], ['Digestório', 'Vasos linfáticos das vilosidades absorvem gorduras.'], ['Tegumentar', 'A pele é a primeira barreira da imunidade inata.']] },
          { recall: ['Onde são produzidos os linfócitos?', 'Na medula óssea vermelha. Os linfócitos T amadurecem depois no timo.'] },
        ] },
      ],
      sint: {
        text: 'O sistema linfático drena o líquido dos tecidos e o devolve ao sangue, passando por linfonodos que filtram a linfa. A imunidade inata age rápido e sem especificidade; a adaptativa é específica e forma memória, princípio usado pelas vacinas.',
        conf: [['Vacina × soro', 'Vacina previne e gera memória. Soro trata, com anticorpos prontos.'], ['Antígeno × anticorpo', 'Antígeno é o que o corpo reconhece como estranho. Anticorpo é a proteína que se liga a ele.'], ['Inata × adaptativa', 'A inata é imediata e geral. A adaptativa é específica e tem memória.']],
        cards: [['O que é a linfa?', 'O líquido dos tecidos recolhido pelos vasos linfáticos'], ['Qual é a função dos linfonodos?', 'Filtrar a linfa e abrigar células de defesa'], ['Que células produzem anticorpos?', 'Os linfócitos B'], ['Por que a vacina protege?', 'Porque estimula a produção de anticorpos e de células de memória']],
      },
    },

    reprodutor: {
      title: 'Sistema reprodutor', short: 'Reprodutor', dur: 30, hero: 'r-reprodutor',
      lead: 'Produz gametas e hormônios sexuais e torna possível a reprodução.',
      goals: ['Os órgãos dos sistemas reprodutores masculino e feminino.', 'Onde os gametas são produzidos e onde ocorre a fecundação.', 'Como os hormônios regulam o ciclo menstrual.'],
      secs: [
        { t: 'Introdução', h: 'Como duas células dão origem a um novo organismo?', b: [
          { p: 'A reprodução humana depende do encontro de dois gametas: o espermatozoide e o ovócito. Cada um carrega metade do material genético. As gônadas, testículos e ovários, produzem os gametas e também os hormônios sexuais.' },
          { fig: 'r-reprodutor', cap: 'O modelo 3D do Atlas traz apenas a referência masculina. As duas anatomias aparecem nos esquemas desta aula.' },
        ] },
        { t: 'Anatomia masculina', h: 'Produção e condução dos espermatozoides', b: [
          { p: 'Os espermatozoides são produzidos nos testículos, dentro dos túbulos seminíferos, e amadurecem no epidídimo. Na ejaculação, seguem pelo ducto deferente e pela uretra. Vesículas seminais e próstata acrescentam os líquidos que formam o sêmen.' },
          { fig: 'repmasc', cap: 'Sistema reprodutor masculino em corte lateral.' },
          { recall: ['Por que os testículos ficam fora da cavidade abdominal?', 'Porque a produção de espermatozoides exige temperatura um pouco menor que a do interior do corpo.'] },
        ] },
        { t: 'Anatomia feminina', h: 'Ovários, tubas e útero', b: [
          { p: 'Os ovários produzem os ovócitos e os hormônios estrogênio e progesterona. A cada ciclo, um ovócito é liberado e captado pela tuba uterina, onde pode ocorrer a fecundação. O embrião se implanta no endométrio, a camada interna do útero.' },
          { fig: 'repfem', cap: 'Sistema reprodutor feminino em vista frontal.' },
          { warn: ['“A fecundação acontece no útero.”', 'Em condições normais, o encontro dos gametas ocorre na tuba uterina. No útero ocorre a implantação do embrião, dias depois.'] },
        ] },
        { t: 'Regulação hormonal', h: 'O ciclo menstrual', b: [
          { p: 'O ciclo dura em média 28 dias e é comandado pela hipófise. O FSH estimula o amadurecimento do folículo no ovário, que produz estrogênio. Por volta do 14º dia, um pico de LH provoca a ovulação.' },
          { p: 'Depois da ovulação, o corpo-lúteo produz progesterona, que mantém o endométrio espesso. Se não há fecundação, os hormônios caem, o endométrio descama e ocorre a menstruação.' },
          { cols: [['FSH', 'Amadurece o folículo ovariano.'], ['LH', 'Seu pico desencadeia a ovulação.'], ['Estrogênio', 'Faz o endométrio crescer.'], ['Progesterona', 'Mantém o endométrio preparado para a implantação.']] },
          { recall: ['Nos homens, qual hormônio os testículos produzem?', 'A testosterona, sob estímulo do LH da hipófise.'] },
        ] },
      ],
      sint: {
        text: 'Testículos e ovários produzem gametas e hormônios sexuais. A fecundação ocorre na tuba uterina, e o embrião se implanta no útero. Hormônios da hipófise e dos ovários regulam o ciclo menstrual.',
        conf: [['Fecundação × implantação', 'A fecundação ocorre na tuba uterina. A implantação, no útero.'], ['Ovulação × menstruação', 'Ovulação é a liberação do ovócito. Menstruação é a descamação do endométrio.'], ['Ducto deferente × uretra', 'O ducto deferente conduz só espermatozoides. A uretra masculina conduz sêmen e urina.']],
        cards: [['Onde são produzidos os espermatozoides?', 'Nos testículos, nos túbulos seminíferos'], ['Onde ocorre a fecundação?', 'Na tuba uterina'], ['Que hormônio desencadeia a ovulação?', 'O LH, hormônio luteinizante'], ['Qual é a função da progesterona no ciclo?', 'Manter o endométrio preparado para a implantação']],
      },
    },

    integracao: {
      title: 'Integração e revisão', short: 'Integração', dur: 25, hero: 'r-corpo',
      lead: 'Três situações do dia a dia mostram como os sistemas respondem juntos para manter o corpo em equilíbrio.',
      goals: ['Como vários sistemas respondem ao exercício físico.', 'O percurso dos nutrientes depois de uma refeição.', 'Como o corpo reage à falta de água.'],
      secs: [
        { t: 'Introdução', h: 'Algum sistema trabalha sozinho?', b: [
          { p: 'Não. Ao longo da trilha, cada aula terminou mostrando ligações com outros sistemas. Agora o ponto de partida muda: em vez de um sistema, uma situação. Em cada uma, acompanhe quem detecta a mudança, quem coordena e quem executa.' },
          { fig: 'r-corpo', cap: 'O organismo como um todo: cada resposta do corpo envolve vários sistemas ao mesmo tempo.' },
        ] },
        { t: 'Exercício físico', h: 'Durante uma corrida', b: [
          { p: 'Os músculos em atividade consomem mais oxigênio e glicose e produzem mais gás carbônico e calor. O corpo precisa entregar mais, retirar mais e não superaquecer.' },
          { cols: [['Nervoso', 'Detecta o aumento de gás carbônico e acelera a respiração e os batimentos.'], ['Respiratório', 'Aumenta a ventilação: mais oxigênio entra, mais gás carbônico sai.'], ['Cardiovascular', 'O coração bombeia mais sangue, e os vasos dos músculos ativos se dilatam.'], ['Tegumentar', 'Suor e dilatação dos vasos da pele dissipam o calor.']] },
          { recall: ['Por que a pele fica vermelha durante o exercício?', 'Porque os vasos da derme se dilatam para perder calor.'] },
        ] },
        { t: 'Alimentação', h: 'Depois de uma refeição', b: [
          { p: 'O digestório quebra os alimentos e absorve os nutrientes no intestino delgado. A glicose entra no sangue, e a glicemia sobe. O pâncreas libera insulina, as células captam glicose, e o fígado armazena o excesso como glicogênio.' },
          { fig: 'glicemia', cap: 'A regulação da glicemia liga os sistemas digestório, cardiovascular e endócrino.' },
          { warn: ['“Depois de absorvida, a glicose fica circulando até ser usada.”', 'A glicemia é controlada de perto. O excesso é armazenado sob ação da insulina e devolvido ao sangue no jejum, sob ação do glucagon.'] },
        ] },
        { t: 'Desidratação', h: 'Quando falta água', b: [
          { p: 'Com pouca água, o sangue fica mais concentrado. O hipotálamo detecta a mudança, gera a sensação de sede e faz a hipófise liberar ADH. Os rins reabsorvem mais água, e a urina sai concentrada e em pouco volume.' },
          { cols: [['Nervoso', 'O hipotálamo detecta a concentração do sangue e produz a sede.'], ['Endócrino', 'O ADH leva a ordem até os rins.'], ['Urinário', 'Os néfrons reabsorvem mais água.']] },
          { note: ['Para fechar', 'Nas três situações o padrão se repete: um desvio é detectado, uma resposta coordenada reduz esse desvio, e o equilíbrio volta. É a homeostase, que abriu a trilha.'] },
        ] },
      ],
      sint: {
        text: 'Exercício, alimentação e desidratação mostram o mesmo padrão: receptores detectam um desvio, os sistemas nervoso e endócrino coordenam, e os demais executam a resposta que devolve o equilíbrio.',
        conf: [['Coordenar × executar', 'Nervoso e endócrino coordenam. Os demais sistemas executam as respostas.'], ['Resposta rápida × duradoura', 'A nervosa age em segundos. A hormonal demora mais e dura mais.'], ['Um sistema × o organismo', 'Nenhuma função vital depende de um sistema só.']],
        cards: [['No exercício, o que acelera a respiração?', 'O aumento de gás carbônico no sangue, detectado pelo sistema nervoso'], ['O que acontece com a glicose em excesso depois da refeição?', 'É armazenada como glicogênio, sob ação da insulina'], ['Qual hormônio faz os rins conservarem água?', 'O ADH, hormônio antidiurético'], ['Que conceito une todas as respostas integradas do corpo?', 'A homeostase']],
      },
    },
  };

  // ───── Ligação com o modelo 3D ─────
  // Vista do modelo em cada aula: m = {sys:[sistemas visíveis]} (vazio = corpo inteiro), parts:[sistema, [trechos do nome]] para destacar.
  // secM sobrescreve a vista em seções específicas (índice da seção).
  const VIEW = {
    organizacao: { m: {}, secM: { 1: { sys: ['digestorio'], parts: ['digestorio', ['estômago']] } } },
    digestorio: { m: { sys: ['digestorio'] } },
    respiratorio: { m: { sys: ['respiratorio'] }, secM: { 2: { micro: 'alveolo' }, 3: { sys: ['respiratorio', 'cardiovascular'] } } },
    urinario: { m: { sys: ['urinario'] }, secM: { 1: { sys: ['urinario', 'cardiovascular'] } } },
    nervoso: { m: { sys: ['nervoso'] } },
    endocrino: { m: { sys: ['endocrino'] }, secM: { 2: { sys: ['digestorio'], parts: ['digestorio', ['pâncreas', 'fígado']] } } },
    esqueletico: { m: { sys: ['esqueletico'] } },
    muscular: { m: { sys: ['muscular'] }, secM: { 3: { sys: ['muscular'], parts: ['muscular', ['bíceps braquial', 'triceps brachii']] } } },
    tegumentar: { m: { sys: ['tegumentar'] } },
    linfatico: { m: { sys: ['linfatico'] } },
    reprodutor: { m: { sys: ['reprodutor'] } },
    integracao: { m: {}, secM: { 1: { sys: ['cardiovascular', 'respiratorio'] }, 2: { sys: ['digestorio'], parts: ['digestorio', ['pâncreas', 'fígado']] }, 3: { sys: ['urinario', 'nervoso', 'endocrino'] } } },
  };
  for (const id in VIEW) { LESSONS[id].m = VIEW[id].m; LESSONS[id].secs.forEach((s, i) => { s.m = (VIEW[id].secM || {})[i] || VIEW[id].m; }); }

  // Termos do texto que viram link "ver no modelo": [expressão no texto, sistema do modelo, trechos do nome da estrutura].
  // Sem trechos (null) = mostra o sistema inteiro. Só entram estruturas que existem no modelo.
  const D = 'digestorio', U = 'urinario', N = 'nervoso', E = 'esqueletico', M = 'muscular', C = 'cardiovascular', X = 'endocrino', RP = 'reprodutor', RS = 'respiratorio';
  const TERMS = [
    ['estômago', D, ['estômago']], ['fígado', D, ['fígado']], ['pâncreas', D, ['pâncreas']], ['vesícula biliar', D, ['vesícula biliar']], ['esôfago', D, ['esôfago']],
    ['intestino delgado', D, ['duodeno', 'jejuno', 'íleo']], ['intestino grosso', D, ['colo (', 'reto', 'apêndice']], ['duodeno', D, ['duodeno']],
    ['traqueia', RS, ['traqueia']], ['brônquios', RS, ['brônquios']], ['pulmões', RS, ['pulmão']], ['laringe', RS, ['cartilagem tireóidea']], ['diafragma', M, ['diafragma']],
    ['rins', U, ['rim ']], ['rim', U, ['rim ']], ['ureteres', U, ['ureter']], ['ureter', U, ['ureter']], ['bexiga', U, ['bexiga']], ['uretra', U, ['uretra']],
    ['artéria renal', C, ['artéria renal']], ['veia renal', C, ['veia renal']],
    ['encéfalo', N, null], ['cerebelo', N, ['cerebelo']], ['bulbo', N, ['bulbo']], ['hipotálamo', N, ['hipotálamo']],
    ['hipófise', X, ['hipófise']], ['suprarrenais', X, ['suprarrenal']], ['glândulas suprarrenais', X, ['suprarrenal']],
    ['crânio', E, ['frontal', 'occipital', 'parietal bone', 'temporal bone', 'esfenoide', 'mandíbula', 'maxilla']], ['coluna vertebral', E, ['vertebra', 'atlas (c1)', 'áxis', 'sacro']],
    ['caixa torácica', E, [' rib', 'esterno', 'costal cartilage']], ['fêmur', E, ['fêmur']], ['esqueleto', E, null], ['ossos', E, null],
    ['bíceps', M, ['bíceps braquial']], ['tríceps', M, ['triceps brachii']], ['músculos', M, null],
    ['pele', 'tegumentar', null], ['baço', 'linfatico', ['baço']], ['timo', 'linfatico', ['timo']],
    ['testículos', RP, ['testículo']], ['epidídimo', RP, ['epididymis']], ['próstata', RP, ['próstata']], ['vesículas seminais', RP, ['glândula seminal']],
    ['coração', C, ['parede do coração']],
  ];
  // Aula do cardiovascular (seções fixas no index.html): vista por seção, estruturas da lista do coração e trechos para o cartão do atlas.
  const CARDIO = {
    views: [{ sys: [C] }, { sys: [C], parts: [C, ['parede do coração']] }, { sys: [C] }, { sys: [C, RS] }, { micro: true }, { sys: [C, RS, D, U] }],
    hot: { 1: ['parede do coração'], 2: ['parede do coração'], 3: ['parede do coração'], 4: ['parede do coração'], 5: ['valva tricúspide'], 6: ['valva mitral'], 7: ['aorta'], 8: ['tronco e artérias pulmonares'] },
    atlas: [
      { q: ['valva'], sec: 1, t: 'Valvas se fecham para impedir o refluxo e manter um único sentido de fluxo.' },
      { q: ['parede do coração', 'papillary'], sec: 1, t: 'O coração tem quatro câmaras: dois átrios, que recebem o sangue, e dois ventrículos, que o impulsionam para as artérias.' },
      { q: ['aorta'], sec: 3, t: 'A aorta é a maior artéria do corpo; ramifica-se e distribui o sangue pela circulação sistêmica.' },
      { q: ['veia cava'], sec: 3, t: 'As veias cavas superior e inferior trazem o sangue dos tecidos de volta ao coração.' },
      { q: ['pulmonar'], sec: 3, t: 'Artérias pulmonares levam o sangue do coração aos pulmões; veias pulmonares o trazem de volta ao átrio esquerdo.' },
      { q: ['artéria', 'artery', 'tronco', 'ramo'], sec: 2, t: 'Artérias saem do coração em direção aos órgãos. O nome do vaso depende da direção do fluxo, não do teor de oxigênio.' },
      { q: ['veia', 'vein', 'seio'], sec: 2, t: 'Veias chegam ao coração, vindas dos órgãos. Sua parede é mais fina que a arterial, e muitas têm valvas.' },
    ],
    lead: 'Coração e vasos mantêm o sangue em circulação e ligam os locais de absorção e de troca a cada célula do organismo.',
  };

  window.AV_IMG = IMG;
  window.AV_LESSONS = LESSONS;
  // Legendas das ampliações didáticas (cenas esquemáticas, fora de escala), mostradas no painel do modelo.
  window.AV_MICRO = {
    capilar: { name: 'Rede capilar em um músculo', legend: [['#C7404D', 'Arteríola: chega com sangue rico em O₂'], ['#8A66B0', 'Capilares: onde ocorrem as trocas'], ['#3D62B4', 'Vênula: recolhe sangue com mais CO₂'], ['#D44A55', 'Hemácias em movimento']] },
    alveolo: { name: 'Alvéolo e seus capilares', legend: [['#E5A8B4', 'Saco alveolar, cheio de ar'], ['#3D62B4', 'Da artéria pulmonar: sangue pobre em O₂'], ['#C7404D', 'Para a veia pulmonar: sangue rico em O₂'], ['#9FE3F2', 'O₂: do ar para o sangue'], ['#F0B45A', 'CO₂: do sangue para o ar']] },
  };
  window.AV_TERMS = TERMS;
  window.AV_CARDIO = CARDIO;
})();
