// Atlas Vivo — aula aprofundada: sistema muscular. Texto original em português, escrito para este projeto.
(window.AV_LESSON_DEEP = window.AV_LESSON_DEEP || {}).muscular = {
  dur: 50,
  lead: 'Como as fibras musculares se contraem, de onde vem a energia, por que existem fibras lentas e rápidas e o que treino, fadiga e doenças mudam no músculo.',
  goals: [
    'Diferenciar os três tipos de tecido muscular e suas funções.',
    'Descrever a organização do músculo esquelético até o sarcômero.',
    'Explicar a contração: junção neuromuscular, cálcio e filamentos deslizantes.',
    'Relacionar as fontes de energia à duração e à intensidade do exercício, e os tipos de fibra ao desempenho.',
    'Reconhecer adaptações ao treino, lesões e doenças que afetam o músculo.'],
  enem: [
    'Contração muscular: actina, miosina, ATP e cálcio.',
    'Fermentação lática × respiração aeróbica no exercício; fadiga e câimbra.',
    'Fibras vermelhas (lentas) e brancas (rápidas): comparações entre animais e atletas.',
    'Músculo liso, cardíaco e esquelético: controle voluntário e involuntário.',
    'Tétano e botulismo; anabolizantes; sedentarismo.'],
  refs: [
    ['OpenStax — Anatomia e Fisiologia 2e, caps. 10–11: Tecido muscular', 'https://openstax.org/books/anatomy-and-physiology-2e/pages/10-introduction', 'CC BY-NC-SA 4.0, consulta para conferir fatos; texto próprio'],
    ['Ministério da Saúde — Biblioteca Virtual em Saúde (BVS/MS)', 'https://bvsms.saude.gov.br/', 'publicações oficiais, consulta'],
    ['Matriz de Referência do Enem (Inep)', 'https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/matrizes-de-referencia-enem', 'documento oficial']],
  secs: [
    { ch: 'Cap. 1, Bases', t: 'Tipos de músculo', h: 'Três tecidos, um mesmo princípio', m: { sys: ['muscular'] }, b: [
      { p: 'Os músculos transformam energia química (ATP) em força e movimento. Além de mover o esqueleto, mantêm a postura, empurram o conteúdo de órgãos ocos, impulsionam o sangue e produzem calor, que ajuda a manter a temperatura do corpo. Todas as células musculares são excitáveis (respondem a estímulos), contráteis (encurtam), extensíveis e elásticas.' },
      { fig: 'r-muscular', cap: 'Musculatura esquelética em vista frontal.' },
      { table: { cap: 'Os três tipos de tecido muscular', head: ['Característica', 'Esquelético', 'Cardíaco', 'Liso'], rows: [
        ['Controle', 'Voluntário', 'Involuntário', 'Involuntário'],
        ['Aspecto', 'Estriado; células longas com muitos núcleos periféricos', 'Estriado; células ramificadas com um núcleo, unidas por discos intercalares', 'Sem estrias; células fusiformes com um núcleo'],
        ['Onde está', 'Ligado aos ossos por tendões', 'Parede do coração (miocárdio)', 'Paredes do tubo digestório, vasos, bexiga, útero, vias aéreas'],
        ['Contração', 'Rápida; fadiga com facilidade', 'Rítmica; resistente à fadiga', 'Lenta e prolongada'],
        ['Controle nervoso', 'Sistema nervoso somático', 'Autônomo e marca-passo próprio', 'Autônomo e hormônios']] } },
    ] },
    { ch: 'Cap. 1, Bases', t: 'Organização do músculo esquelético', h: 'Do músculo ao sarcômero', m: { sys: ['muscular'], parts: ['muscular', ['bíceps braquial']] }, b: [
      { p: 'Um músculo é envolvido por tecido conjuntivo e formado por feixes (fascículos) de fibras musculares, que são as células. Cada fibra tem centenas de miofibrilas, cilindros finos formados por unidades repetidas, os sarcômeros, onde ocorre a contração. Os tecidos conjuntivos se unem nas extremidades e formam o tendão, que prende o músculo ao osso.' },
      { fig: 'sarcomero', cap: 'Sarcômero: filamentos finos (actina) e grossos (miosina), linhas Z e M, bandas A e I.' },
      { ul: ['Origem: ponto de fixação do músculo que se move menos; inserção: o que se move mais.', 'Agonista (principal motor) e antagonista (faz o movimento oposto): bíceps e tríceps no braço; quadríceps e isquiotibiais na coxa.', 'Os músculos trabalham sobre os ossos como alavancas: a contração puxa o osso em torno de uma articulação.'] },
    ] },
    { ch: 'Cap. 2, Contração', t: 'Como a fibra contrai', h: 'Filamentos que deslizam', m: { sys: ['muscular', 'nervoso'] }, b: [
      { steps: { t: 'contração do músculo esquelético', items: [
        'Um neurônio motor libera acetilcolina na junção neuromuscular.',
        'A acetilcolina se liga a receptores da fibra e gera um potencial de ação, que percorre a membrana e entra na fibra.',
        'O retículo sarcoplasmático libera íons Ca²⁺ no interior da fibra.',
        'O Ca²⁺ liga-se à troponina, que desloca a tropomiosina e expõe os pontos de ligação da actina.',
        'As cabeças de miosina, energizadas por ATP, ligam-se à actina e puxam os filamentos finos em direção ao centro do sarcômero (ponte cruzada).',
        'Um novo ATP solta a miosina e o ciclo se repete enquanto houver Ca²⁺ e ATP; o sarcômero encurta.',
        'Quando o estímulo cessa, o Ca²⁺ volta ao retículo, a tropomiosina cobre os sítios e o músculo relaxa.'] } },
      { note: ['Detalhe importante', 'Os filamentos não encurtam: deslizam uns sobre os outros. Por isso a banda A (comprimento do filamento grosso) não muda, enquanto as bandas I e H diminuem. O ATP não é usado só para a contração: sem ATP, a miosina não se solta da actina, e o músculo fica rígido (rigor mortis, depois da morte).'] },
      { p: 'Cada neurônio motor inerva várias fibras: o conjunto é a unidade motora. Para aumentar a força, o sistema nervoso recruta mais unidades motoras e aumenta a frequência dos impulsos. Movimentos delicados usam unidades pequenas (dedos); movimentos de força, unidades grandes (coxa).' },
    ] },
    { ch: 'Cap. 3, Energia', t: 'Fontes de energia e tipos de fibra', h: 'Sprint ou maratona', m: { sys: ['muscular', 'cardiovascular'] }, b: [
      { table: { cap: 'Como a fibra obtém ATP', head: ['Via', 'Combustível', 'Rendimento e duração', 'Exemplo'], rows: [
        ['ATP armazenado', 'ATP já presente', 'Dura segundos', 'Primeiros movimentos'],
        ['Creatina fosfato', 'Reserva que regenera ATP rapidamente', 'Cerca de 10 s de esforço máximo', 'Salto, arremesso'],
        ['Glicólise anaeróbica (fermentação lática)', 'Glicose do sangue e glicogênio', 'Rápida, pouco ATP por glicose; forma lactato; dura de 1 a 2 minutos de esforço intenso', 'Corrida de 400 m'],
        ['Respiração aeróbica', 'Glicose, ácidos graxos e, em menor grau, aminoácidos; usa O₂ nas mitocôndrias', 'Lenta, muito ATP por glicose; sustenta exercício prolongado', 'Maratona, caminhada']] } },
      { p: 'A fadiga muscular tem várias causas: esgotamento de ATP e de glicogênio, acúmulo de íons e alterações no sistema nervoso. O lactato produzido na glicólise anaeróbica é reaproveitado pelo fígado e pelo coração; a dor muscular tardia depois de exercício intenso é causada por microlesões nas fibras, não por lactato acumulado. A câimbra é uma contração involuntária e dolorosa, associada a fadiga, desidratação e desequilíbrio de eletrólitos.' },
      { table: { cap: 'Fibras musculares esqueléticas', head: ['Característica', 'Tipo I (lenta, oxidativa)', 'Tipo II (rápida, glicolítica)'], rows: [
        ['Cor', 'Vermelha, rica em mioglobina e mitocôndrias', 'Mais clara (branca), menos mioglobina'],
        ['Metabolismo', 'Aeróbico', 'Predominantemente anaeróbico'],
        ['Contração e fadiga', 'Lenta; resistente à fadiga', 'Rápida e forte; fadiga logo'],
        ['Predomina em', 'Postura, corrida de longa distância, voo prolongado das aves migratórias', 'Corridas curtas, saltos, arremessos']] } },
      { p: 'A mioglobina é uma proteína que armazena O₂ no músculo, daí a cor vermelha das fibras de contração lenta. Em animais, a proporção entre os dois tipos de fibra se relaciona ao modo de vida: aves de voo prolongado têm músculos peitorais ricos em fibras vermelhas, enquanto aves que fogem em rajadas curtas têm fibras claras. Nos humanos, a proporção é em parte herdada e em parte modificada pelo treino.' },
    ] },
    { ch: 'Cap. 3, Energia', t: 'Adaptação, lesões e doenças', h: 'O que o treino muda e o que pode dar errado', m: { sys: ['muscular'] }, b: [
      { p: 'O treino de força provoca hipertrofia, aumento do tamanho das fibras pela síntese de mais proteínas contráteis. O treino aeróbico aumenta mitocôndrias, capilares e a capacidade de usar O₂. A inatividade provoca atrofia, perda de massa e força, que se acelera em idosos (sarcopenia) e em quem fica imobilizado. Atividade física regular é um dos hábitos mais protetores para o coração, os ossos, a glicemia e a saúde mental.' },
      { table: { cap: 'Problemas que afetam os músculos', head: ['Condição', 'Causa', 'Observação'], rows: [
        ['Distensão e ruptura muscular', 'Estiramento excessivo das fibras', 'Aquecimento e alongamento ajudam a prevenir'],
        ['Tendinite', 'Inflamação do tendão por sobrecarga', 'Comum com movimentos repetitivos'],
        ['LER/DORT', 'Lesões por esforço repetitivo e distúrbios relacionados ao trabalho', 'Ergonomia e pausas'],
        ['Tétano', 'Toxina da bactéria Clostridium tetani, que entra em feridas profundas e sujas, bloqueia a inibição dos neurônios motores', 'Contrações sustentadas e dolorosas; vacina e reforços previnem'],
        ['Botulismo', 'Toxina de Clostridium botulinum, impede a liberação de acetilcolina', 'Paralisia flácida; conservas mal preparadas'],
        ['Miastenia grave', 'Autoanticorpos contra receptores de acetilcolina', 'Fraqueza que piora com o esforço'],
        ['Distrofia muscular de Duchenne', 'Mutação no gene da distrofina, ligada ao cromossomo X', 'Afeta principalmente meninos; fraqueza progressiva']] } },
      { warn: ['“Anabolizante dá músculo sem consequências.”', 'Esteroides anabolizantes imitam a testosterona e podem causar alterações cardíacas, hepáticas, hormonais e psíquicas, além de dependência. O ganho muscular saudável vem de treino, alimentação com proteína adequada e descanso.'] },
    ] },
    { ch: 'Cap. 4, Integração', t: 'Músculos cardíaco e liso, e a integração', h: 'Os músculos que ninguém comanda', m: { sys: ['muscular', 'cardiovascular', 'digestorio'] }, b: [
      { p: 'O músculo cardíaco contrai em ritmo próprio, com células unidas por discos intercalares, o que faz o coração agir como uma unidade. O músculo liso das paredes do tubo digestório produz o peristaltismo; o dos vasos regula o diâmetro e, portanto, a pressão; o dos brônquios regula a passagem de ar; o do útero se contrai no parto.' },
      { cols: [['Nervoso', 'Neurônios motores comandam cada fibra; o cerebelo coordena o movimento.'], ['Esquelético', 'Músculos movimentam ossos por alavancas; a carga estimula a formação de osso.'], ['Cardiovascular e respiratório', 'Exercício exige mais O₂ e glicose: coração e pulmões aceleram para entregar.']] },
      { cols: [['Endócrino', 'Adrenalina, insulina, GH e testosterona regulam a energia e o crescimento do músculo.'], ['Tegumentar', 'O calor produzido pela contração é dissipado pela pele; o tremor de frio é contração muscular para gerar calor.'], ['Digestório', 'Proteínas da dieta fornecem aminoácidos; o fígado reabastece glicose para o músculo.']] },
    ] },
  ],
  sint: {
    text: 'O músculo esquelético contrai quando o neurônio motor libera acetilcolina, o cálcio é liberado e os filamentos de actina e miosina deslizam, consumindo ATP. A energia vem de ATP, creatina fosfato, glicólise anaeróbica e respiração aeróbica, em proporções que dependem da duração do esforço. Fibras lentas (aeróbicas) resistem à fadiga; as rápidas (glicolíticas) geram mais força por pouco tempo. O músculo liso e o cardíaco são involuntários.',
    conf: [
      ['Tendão × ligamento', 'Tendão liga músculo a osso; ligamento liga osso a osso.'],
      ['Fadiga × dor tardia', 'Fadiga é a queda da capacidade de contração; a dor tardia vem de microlesões, não de ácido lático acumulado.'],
      ['Hipertrofia × hiperplasia', 'Na hipertrofia as fibras crescem; hiperplasia é aumento do número de células (pouco relevante no músculo adulto).'],
      ['Estriado esquelético × cardíaco', 'Ambos são estriados; o esquelético é voluntário e o cardíaco é involuntário.']],
    cards: [
      ['O que libera o cálcio na fibra muscular?', 'O retículo sarcoplasmático, depois do potencial de ação.'],
      ['Qual o papel do ATP na contração?', 'Fornece energia para o movimento da miosina e permite que ela se solte da actina.'],
      ['O que o sarcômero faz ao contrair?', 'Encurta; os filamentos deslizam sem encurtar.'],
      ['O que é mioglobina?', 'Proteína que armazena O₂ no músculo, típica das fibras vermelhas.'],
      ['Quanto dura a energia da creatina fosfato?', 'Cerca de 10 segundos de esforço máximo.'],
      ['Por que o tétano causa contrações sustentadas?', 'A toxina bloqueia a inibição dos neurônios motores, mantendo os músculos contraídos.'],
      ['O que causa o rigor mortis?', 'Falta de ATP: a miosina não se solta da actina.']],
  },
};
