// Atlas Vivo — aula aprofundada: sistema nervoso e sentidos. Texto original em português, escrito para este projeto.
(window.AV_LESSON_DEEP = window.AV_LESSON_DEEP || {}).nervoso = {
  dur: 75,
  lead: 'Como os neurônios geram e transmitem sinais, como o encéfalo e a medula integram informações, como o corpo coordena órgãos sem pensar e como os sentidos trazem o mundo para dentro.',
  goals: [
    'Explicar o potencial de repouso, o potencial de ação e a condução do impulso.',
    'Descrever a sinapse química e o que muda quando drogas e doenças a afetam.',
    'Localizar as principais regiões do encéfalo e suas funções.',
    'Distinguir sistema nervoso somático e autônomo (simpático e parassimpático) e interpretar um arco reflexo.',
    'Descrever os sentidos: visão, audição, equilíbrio, olfato, paladar e tato.'],
  enem: [
    'Neurônio, impulso nervoso e sinapse; neurotransmissores.',
    'Efeitos de drogas, anestésicos e toxinas sobre a sinapse; dependência química.',
    'Sistema nervoso autônomo: situações de estresse, luta ou fuga.',
    'Arco reflexo; funções de cerebelo, bulbo, hipotálamo.',
    'Visão: miopia, hipermetropia, daltonismo; audição e equilíbrio.',
    'Doenças neurológicas: Parkinson, Alzheimer, AVC, meningite.'],
  refs: [
    ['OpenStax — Anatomia e Fisiologia 2e, caps. 12–17: Sistema nervoso e sentidos', 'https://openstax.org/books/anatomy-and-physiology-2e/pages/12-introduction', 'CC BY-NC-SA 4.0, consulta para conferir fatos; texto próprio'],
    ['Ministério da Saúde — Biblioteca Virtual em Saúde (BVS/MS)', 'https://bvsms.saude.gov.br/', 'publicações oficiais, consulta'],
    ['Matriz de Referência do Enem (Inep)', 'https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/matrizes-de-referencia-enem', 'documento oficial']],
  secs: [
    { ch: 'Cap. 1, Bases', t: 'Visão geral e células nervosas', h: 'Receber, integrar e responder', m: { sys: ['nervoso'] }, b: [
      { p: 'O sistema nervoso faz três coisas ao mesmo tempo: capta informações do ambiente e do próprio corpo (função sensorial), interpreta e decide (integração) e comanda músculos e glândulas (função motora). A comunicação é rápida, por impulsos elétricos e por mensageiros químicos, em milissegundos.' },
      { cols: [['Sistema nervoso central (SNC)', 'Encéfalo e medula espinal, protegidos pelo crânio e pela coluna vertebral. Integra as informações.'], ['Sistema nervoso periférico (SNP)', 'Nervos e gânglios fora do SNC. Leva sinais dos sensores ao SNC e do SNC aos órgãos.'], ['Divisões funcionais', 'Somático (voluntário, músculos esqueléticos) e autônomo (involuntário, músculo liso, cardíaco e glândulas).']] },
      { p: 'O tecido nervoso tem neurônios e células da glia. O neurônio tem corpo celular (com núcleo), dendritos (recebem sinais) e um axônio (conduz o sinal). Muitos axônios são envolvidos por bainha de mielina, formada por oligodendrócitos no SNC e por células de Schwann no SNP. A glia dá suporte, nutre e protege: astrócitos, microglia (defesa) e as já citadas células produtoras de mielina.' },
      { fig: 'neuronio', cap: 'Neurônio: dendritos, corpo celular, axônio com bainha de mielina e terminais sinápticos.' },
      { recall: ['Por que os dendritos são a “entrada” e o axônio, a “saída” do neurônio?', 'Porque os dendritos têm receptores que captam sinais de outras células, e o axônio conduz o impulso até os terminais, onde há liberação de neurotransmissor.'] },
    ] },
    { ch: 'Cap. 1, Bases', t: 'Impulso nervoso', h: 'Como um sinal elétrico percorre o axônio', m: { sys: ['nervoso'] }, b: [
      { p: 'Em repouso, a membrana do neurônio é polarizada: o interior é negativo em relação ao exterior, com cerca de −70 mV. Isso se deve à bomba de sódio e potássio (que consome ATP e expulsa 3 Na⁺ para cada 2 K⁺ que entram) e à maior permeabilidade da membrana ao K⁺ em repouso.' },
      { steps: { t: 'potencial de ação', items: [
        'Um estímulo despolariza a membrana até o limiar (cerca de −55 mV).',
        'Canais de Na⁺ dependentes de voltagem se abrem: o Na⁺ entra e o interior fica positivo (despolarização).',
        'Os canais de Na⁺ se inativam e os de K⁺ se abrem: o K⁺ sai e o potencial volta ao negativo (repolarização).',
        'A bomba de Na⁺/K⁺ restaura a distribuição original dos íons; a membrana pode ficar brevemente mais negativa que o repouso (hiperpolarização) e há um período refratário.',
        'O potencial de ação desencadeia o próximo trecho do axônio e se propaga sem perder intensidade.'] } },
      { warn: ['“O impulso nervoso é uma corrente elétrica como a dos fios.”', 'Em um fio, elétrons se deslocam a velocidades próximas à da luz. No axônio, o impulso é uma onda de inversão de cargas causada pela entrada e saída de íons; é bem mais lenta (de cerca de 1 m/s em fibras sem mielina a mais de 100 m/s nas mielinizadas) e usa energia para restaurar os íons.'] },
      { ul: ['Lei do tudo ou nada: se o limiar é atingido, o potencial de ação tem sempre a mesma amplitude. Estímulos mais fortes aumentam a frequência dos impulsos, não a amplitude.', 'Em axônios mielinizados, o impulso “salta” entre os nós de Ranvier (condução saltatória), o que aumenta muito a velocidade.', 'Na esclerose múltipla, o sistema imune ataca a mielina do SNC e os sinais são conduzidos de forma lenta ou falha.'] },
    ] },
    { ch: 'Cap. 2, Sinapse', t: 'Sinapse química', h: 'A conversa entre duas células', m: { sys: ['nervoso'] }, b: [
      { steps: { t: 'sinapse química', items: [
        'O impulso chega ao terminal do axônio e abre canais de Ca²⁺.',
        'A entrada de Ca²⁺ faz as vesículas liberarem neurotransmissor na fenda sináptica por exocitose.',
        'O neurotransmissor se liga a receptores na célula seguinte e abre canais iônicos: excita (despolariza) ou inibe (hiperpolariza).',
        'O sinal termina: o neurotransmissor é recapturado pelo terminal, destruído por enzimas ou se difunde.'] } },
      { table: { cap: 'Neurotransmissores importantes', head: ['Neurotransmissor', 'Onde atua', 'Exemplos ligados a saúde'], rows: [
        ['Acetilcolina', 'Junção neuromuscular, parassimpático, memória', 'Perdida no Alzheimer; a toxina botulínica impede sua liberação (paralisia); o curare bloqueia seus receptores'],
        ['Dopamina', 'Movimento, motivação e recompensa', 'Parkinson (perda de neurônios dopaminérgicos); drogas como cocaína e anfetaminas aumentam a dopamina na fenda'],
        ['Serotonina', 'Humor, sono, apetite', 'Antidepressivos ISRS impedem a recaptação'],
        ['Noradrenalina', 'Simpático, alerta', 'Estresse e resposta de luta ou fuga'],
        ['GABA', 'Principal inibidor do SNC', 'Ansiolíticos e álcool aumentam seus efeitos'],
        ['Glutamato', 'Principal excitador do SNC', 'Aprendizado e memória; excesso é tóxico']] } },
      { p: 'Muitas drogas psicoativas e fármacos agem na sinapse: aumentando a liberação do neurotransmissor, bloqueando sua recaptação, imitando-o ou bloqueando seus receptores. O uso repetido altera os circuitos de recompensa e gera dependência química. Anestésicos locais, como a lidocaína, bloqueiam canais de Na⁺ e impedem a propagação do impulso doloroso.' },
    ] },
    { ch: 'Cap. 3, O SNC', t: 'Encéfalo e medula espinal', h: 'Quem faz o quê', m: { sys: ['nervoso'] }, b: [
      { table: { cap: 'Regiões do encéfalo e funções', head: ['Região', 'Funções principais'], rows: [
        ['Cérebro: córtex cerebral', 'Percepção consciente, linguagem, raciocínio, memória, movimento voluntário. Lobo frontal (planejamento, movimento), parietal (sensibilidade corporal), temporal (audição, memória), occipital (visão).'],
        ['Tálamo', 'Retransmite quase todas as informações sensoriais ao córtex'],
        ['Hipotálamo', 'Regula temperatura, fome, sede, sono e ciclos; controla a hipófise (liga o sistema nervoso ao endócrino)'],
        ['Sistema límbico', 'Emoção e memória (amígdala, hipocampo)'],
        ['Cerebelo', 'Coordena movimentos, equilíbrio e postura; não inicia o movimento, o refina'],
        ['Tronco encefálico (mesencéfalo, ponte, bulbo)', 'Passagem de vias; o bulbo controla centros vitais: ritmo cardíaco, respiração e pressão']] } },
      { p: 'A medula espinal vai do bulbo até a região lombar. No corte, a substância cinzenta (corpos celulares) forma um “H” e a substância branca (axônios mielinizados) a envolve. Ela conduz sinais entre o encéfalo e o corpo e é o centro de reflexos. Encéfalo e medula são protegidos por três meninges (dura-máter, aracnoide e pia-máter), pelo líquor e pela barreira hematoencefálica, que limita a passagem de substâncias do sangue.' },
      { p: 'A meningite é a inflamação das meninges, causada por vírus ou bactérias (como meningococo e pneumococo). As formas bacterianas são graves; existem vacinas no calendário do SUS e a antibioticoterapia precoce é fundamental.' },
    ] },
    { ch: 'Cap. 3, O SNC', t: 'Nervos, reflexo e sistema autônomo', h: 'O que o corpo faz sem pedir licença', m: { sys: ['nervoso'] }, b: [
      { p: 'O SNP tem 12 pares de nervos cranianos e 31 pares de nervos espinais. Os nervos podem ser sensitivos, motores ou mistos. Um arco reflexo é a resposta rápida e involuntária a um estímulo: o receptor capta, o neurônio sensitivo leva o sinal à medula, um interneurônio integra e o neurônio motor leva o comando ao músculo, que se contrai. Isso ocorre antes de o encéfalo registrar a dor.' },
      { fig: 'reflexo', cap: 'Arco reflexo: do estímulo à resposta, passando pela medula espinal.' },
      { table: { cap: 'Sistema nervoso autônomo', head: ['Efeito em', 'Simpático (luta ou fuga)', 'Parassimpático (repouso e digestão)'], rows: [
        ['Coração', 'Aumenta a frequência e a força', 'Diminui a frequência'],
        ['Pupilas', 'Dilata', 'Contrai'],
        ['Brônquios', 'Dilata', 'Contrai'],
        ['Tubo digestório', 'Reduz movimentos e secreções', 'Aumenta movimentos e secreções'],
        ['Fígado', 'Libera glicose', 'Estimula armazenamento'],
        ['Glândulas sudoríparas', 'Estimula o suor', 'Pouco efeito'],
        ['Neurotransmissor principal', 'Noradrenalina (pós-ganglionar), adrenalina da suprarrenal', 'Acetilcolina']] } },
    ] },
    { ch: 'Cap. 4, Sentidos', t: 'Visão', h: 'Do foco da luz à imagem no cérebro', m: { sys: ['nervoso'], parts: ['nervoso', ['olho', 'eye']] }, b: [
      { p: 'A luz atravessa a córnea e o humor aquoso, passa pela pupila (aberta pela íris), é focalizada pelo cristalino (cuja curvatura é ajustada pelo músculo ciliar) e forma uma imagem invertida na retina, camada de células sensíveis à luz no fundo do olho. Os sinais saem pelo nervo óptico e são processados no lobo occipital.' },
      { cols: [['Cones', 'Concentram-se na fóvea. Funcionam com bastante luz e dão visão colorida e nítida. Há três tipos, sensíveis a vermelho, verde e azul.'], ['Bastonetes', 'Mais numerosos na periferia da retina. Funcionam com pouca luz e não distinguem cores; dependem da vitamina A.'], ['Pupila e íris', 'Com luz forte, a pupila contrai; no escuro, dilata.']] },
      { table: { cap: 'Problemas de visão', head: ['Condição', 'Problema', 'Correção'], rows: [
        ['Miopia', 'Imagem se forma antes da retina; vê mal de longe', 'Lentes divergentes (negativas)'],
        ['Hipermetropia', 'Imagem se forma depois da retina; vê mal de perto', 'Lentes convergentes (positivas)'],
        ['Astigmatismo', 'Curvatura irregular da córnea ou do cristalino', 'Lentes cilíndricas'],
        ['Presbiopia', 'Perda de flexibilidade do cristalino com a idade', 'Lentes para perto'],
        ['Catarata', 'Cristalino opaco', 'Cirurgia'],
        ['Daltonismo', 'Falha em um tipo de cone; mais comum em homens por ser ligado ao cromossomo X', 'Não tem cura; adaptações']] } },
    ] },
    { ch: 'Cap. 4, Sentidos', t: 'Audição, equilíbrio e outros sentidos', h: 'Som, posição, cheiro, gosto e toque', m: { sys: ['nervoso'] }, b: [
      { steps: { t: 'caminho do som', items: [
        'A orelha externa capta as ondas sonoras e as conduz até a membrana timpânica, que vibra.',
        'Na orelha média, os ossículos (martelo, bigorna e estribo) amplificam a vibração e a transmitem à janela oval; a tuba auditiva equaliza a pressão com a faringe.',
        'Na orelha interna, a cóclea, cheia de líquido, transforma a vibração em ondas; células ciliadas do órgão de Corti geram sinais.',
        'O nervo vestibulococlear leva os sinais ao lobo temporal, onde o som é interpretado.'] } },
      { p: 'A orelha interna também tem o labirinto (canais semicirculares e vestíbulo), que detecta a posição e o movimento da cabeça e mantém o equilíbrio. Exposição prolongada a ruído intenso destrói as células ciliadas, o que é irreversível.' },
      { table: { cap: 'Outros sentidos', head: ['Sentido', 'Receptores', 'Observação'], rows: [
        ['Olfato', 'Neurônios olfatórios no teto da cavidade nasal', 'O cheiro e o paladar se combinam na percepção do sabor'],
        ['Paladar', 'Papilas gustativas na língua', 'Doce, salgado, azedo, amargo e umami; as regiões da língua não são “mapas” rígidos'],
        ['Tato', 'Terminações nervosas e corpúsculos na pele', 'Pressão, vibração, temperatura, dor'],
        ['Dor', 'Terminações livres (nociceptores)', 'Sinal de alerta; analgésicos e anestésicos atuam em pontos diferentes do circuito']] } },
    ] },
    { ch: 'Cap. 5, Saúde', t: 'Doenças, drogas e hábitos', h: 'Neurologia no dia a dia', m: { sys: ['nervoso'] }, b: [
      { table: { cap: 'Condições neurológicas e de saúde mental', head: ['Condição', 'O que ocorre', 'Observações'], rows: [
        ['AVC', 'Interrupção da circulação em parte do encéfalo (isquêmico) ou hemorragia', 'Emergência; hipertensão é o principal fator de risco'],
        ['Doença de Parkinson', 'Perda de neurônios que produzem dopamina na substância negra', 'Tremor, rigidez e lentidão'],
        ['Doença de Alzheimer', 'Degeneração de neurônios, com perda de memória e outras funções', 'Principal causa de demência em idosos'],
        ['Epilepsia', 'Descargas elétricas excessivas e anormais em grupos de neurônios', 'Crises; tratamento com medicamentos'],
        ['Meningite', 'Inflamação das meninges', 'Vacinação; tratamento imediato'],
        ['Depressão e transtornos de ansiedade', 'Transtornos de saúde mental com base biológica, psicológica e social', 'Tratáveis; procurar ajuda profissional e a rede de apoio'],
        ['Dependência química', 'Uso repetido de substância altera os circuitos de recompensa', 'Condição de saúde, não falha de caráter; há tratamento no SUS (CAPS)']] } },
      { p: 'Dormir bem é essencial: durante o sono ocorre consolidação da memória e recuperação do organismo. Atividade física, boa alimentação e vínculos sociais também protegem o sistema nervoso, e o álcool e outras drogas o prejudicam em qualquer idade, principalmente na adolescência, quando o encéfalo ainda está em maturação.' },
    ] },
    { ch: 'Cap. 6, Integração', t: 'O nervoso e os outros sistemas', h: 'O maestro e a orquestra', m: { sys: ['nervoso', 'endocrino', 'cardiovascular'] }, b: [
      { cols: [['Endócrino', 'O hipotálamo controla a hipófise: ali sistema nervoso e sistema endócrino se encontram. A medula da suprarrenal funciona como um gânglio simpático modificado.'], ['Muscular e esquelético', 'Neurônios motores controlam cada fibra muscular; o cerebelo coordena a precisão do movimento.'], ['Cardiovascular e respiratório', 'O bulbo ajusta a frequência cardíaca e o ritmo respiratório; o barorreflexo controla a pressão.']] },
      { cols: [['Digestório', 'O sistema nervoso entérico tem mais neurônios que a medula espinal e regula o tubo; o nervo vago o conecta ao encéfalo.'], ['Urinário', 'O reflexo da micção envolve a medula e o encéfalo; o hipotálamo regula a sede e o ADH.'], ['Imune', 'Estresse crônico afeta a defesa do organismo; citocinas influenciam o sono e o humor.']] },
      { note: ['Para integrar', 'Diante de um susto: o encéfalo (amígdala e hipotálamo) ativa o sistema simpático; a suprarrenal libera adrenalina; o coração acelera, as pupilas dilatam, o fígado libera glicose e o tubo digestório reduz a atividade. Sistema nervoso, endócrino, cardiovascular e digestório respondem juntos.'] },
    ] },
  ],
  sint: {
    text: 'Neurônios geram potenciais de ação por mudanças na permeabilidade a Na⁺ e K⁺ e os transmitem às células seguintes por sinapses químicas, nas quais neurotransmissores se ligam a receptores. O SNC integra as informações, o SNP leva os sinais e o sistema autônomo controla funções involuntárias. Os sentidos transformam luz, som, substâncias químicas e pressão em impulsos que o encéfalo interpreta. Drogas e doenças alteram esses processos em pontos específicos.',
    conf: [
      ['Potencial de repouso × de ação', 'O de repouso é a polaridade de −70 mV em um neurônio inativo; o de ação é a inversão rápida e propagada que transporta o sinal.'],
      ['Sinapse × junção neuromuscular', 'A junção neuromuscular é a sinapse entre um neurônio motor e uma fibra muscular, usando acetilcolina.'],
      ['Simpático × parassimpático', 'Simpático prepara para luta ou fuga; parassimpático favorece repouso e digestão.'],
      ['Cones × bastonetes', 'Cones: cor e nitidez com muita luz. Bastonetes: pouca luz, sem cor.']],
    cards: [
      ['O que a bomba de Na⁺/K⁺ faz?', 'Expulsa 3 Na⁺ e traz 2 K⁺, mantendo o potencial de repouso; gasta ATP.'],
      ['Por que a bainha de mielina acelera o impulso?', 'Porque o potencial de ação “salta” entre os nós de Ranvier (condução saltatória).'],
      ['Como o cálcio participa da sinapse?', 'Sua entrada no terminal faz as vesículas liberarem neurotransmissor.'],
      ['O que o cerebelo faz?', 'Coordena movimentos, equilíbrio e postura.'],
      ['Que região controla temperatura, fome e sede?', 'O hipotálamo.'],
      ['Que lente corrige miopia?', 'Divergente (negativa).'],
      ['Que efeito tem o simpático no coração?', 'Aumenta a frequência e a força de contração.']],
  },
};
