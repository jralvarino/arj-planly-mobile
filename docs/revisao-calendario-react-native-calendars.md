# Revisão: replicar o WeekCarousel com react-native-calendars

## 1. O que o WeekCarousel atual faz

| Funcionalidade | Descrição |
|----------------|-----------|
| **Vista** | Faixa horizontal com **7 dias** (Mon–Sun) por ecrã, scroll **dia a dia** (centenas de dias para trás e para a frente, com prepend/append dinâmico nas bordas) |
| **Layout por dia** | Nome do dia (Sun, Mon…), número, botão arredondado com cor de fundo |
| **Cores por dia** | Gradiente por progresso de todos: cinza (0) → laranja claro (1º) → laranja (100%), a partir de `weekSummary` |
| **Troféu** | Ícone 🏆 com animação (scale + rotação) quando o dia está 100% completo |
| **Dia selecionado** | Borda laranja e sombra |
| **Hoje** | Estilo próprio e pequeno indicador (dot) por baixo |
| **Callbacks** | `onDateSelect(date)`, `onWeekChange(startDate, endDate)` quando a **semana visível** muda (para carregar `weekSummary`) |
| **Snap** | Ao soltar o scroll, encaixa para a **segunda-feira** ser o primeiro dia visível |
| **Filtro** | `selectedCategoryId`: cores e troféu por categoria (a partir de `weekSummary`) |

---

## 2. O que o react-native-calendars oferece

A biblioteca **react-native-calendars** (wix) tem estes componentes:

### Calendar
- Grelha de **mês completo** (4–6 semanas)
- Navegação mês a mês (setas ou `enableSwipeMonths`)
- **Não** é uma faixa de 7 dias

### CalendarList
- Lista de **Calendar** (vários meses) com scroll
- `horizontal={true}` + `pagingEnabled` + `calendarWidth`: scroll **horizontal por mês** (cada “página” é um mês inteiro)
- **Não** há modo “só uma semana” nem scroll dia a dia

### Agenda
- **Calendar** (mês) em cima + lista de itens por dia
- `onDayChange`, `loadItemsForMonth`, `items`, `markedDates`
- O calendário continua a ser vista de **mês**

---

## 3. O que é possível replicar (com mudanças de UX)

| Recurso | Com react-native-calendars | Notas |
|---------|----------------------------|--------|
| **Cores por dia** | ✅ Sim | `markingType='custom'` + `markedDates[date].customStyles.container.backgroundColor` a partir de `weekSummary` (e `getDayColor`) |
| **Dia selecionado** | ✅ Sim | `markedDates[date].selected` + `theme.selectedDayBackgroundColor` |
| **Hoje** | ✅ Parcial | `theme.todayTextColor`; o dot por baixo exigiria `dayComponent` custom |
| **onDateSelect** | ✅ Sim | `onDayPress` |
| **firstDay = segunda** | ✅ Sim | `firstDay={1}` |
| **Troféu (100% completo)** | ⚠️ Com `dayComponent` | `dayComponent` pode renderizar ícone extra; é mais trabalho e cuidado com performance |
| **Filtro por categoria** | ✅ Sim | Mesma lógica: construir `markedDates` a partir de `weekSummary` filtrado por `selectedCategoryId` |

---

## 4. O que **não** é possível replicar fielmente

| Recurso | Motivo |
|---------|--------|
| **Vista de 7 dias com scroll dia a dia** | Não existe componente “strip” ou “week carousel”. Calendar e CalendarList mostram **mês** (várias semanas) ou lista de meses. O scroll horizontal do CalendarList é **por mês**, não por dia. |
| **onWeekChange(startDate, endDate)** com a mesma semântica | Existe `onMonthChange` / `onVisibleMonthsChange` (mês), não “mudança de semana visível”. Daria para derivar (start, end) da semana do dia selecionado ou da 1ª semana do mês visível, mas a noção de “semana visível” no scroll não existe. |
| **Snap à segunda-feira ao soltar** | Não há scroll por dia; o snap nativo é por mês no CalendarList horizontal. |
| **Prepend/append de dias nas bordas** | O modelo é por mês (`pastScrollRange` / `futureScrollRange` em meses). Não há lista infinita de dias. |
| **Sempre ~7 dias visíveis** | No CalendarList horizontal, cada página é um **mês** (mais de 7 dias). Não há opção para mostrar só uma semana. |

---

## 5. Resumo

- **Sim, é possível** usar react-native-calendars para **parte** do que o WeekCarousel faz: seleção de dia, cores por dia, “hoje”, segunda como primeiro dia e filtro por categoria. O troféu é exequível com `dayComponent`, mas com mais esforço.
- **Não é possível** manter a **mesma UX** de faixa de 7 dias com scroll dia a dia, snap à segunda e `onWeekChange` ligado ao “scroll de semana”. A biblioteca está desenhada para **vista de mês** e **scroll por mês**, não para um carrossel de dias.

---

## 6. Recomendações

### Opção A: Manter o WeekCarousel atual
- Mantém a UX de faixa semanal e scroll dia a dia.
- Todo o comportamento (snap, onWeekChange, prepend/append, cores, troféu) já está implementado e alinhado com `weekSummary` e `useHomeViewModel`.

### Opção B: Migrar para react-native-calendars (vista de mês)
- **Vantagens:** Menos código próprio de calendário, biblioteca mantida, suporte a `markedDates`, `dayComponent`, temas, etc.
- **Desvantagens:** Mudança clara de UX: em vez de “7 dias, scroll fino por dia”, passa a “mês inteiro, mudança de mês”. É preciso:
  - Adaptar `onWeekChange` (ex.: chamar com a semana do dia selecionado ou da 1ª semana do mês; `loadItemsForMonth` / `onVisibleMonthsChange` para carregar `weekSummary` por mês).
  - Repensar a integração com a lista de todos (Hoje continua a fazer sentido; “semana em foco” fica mais ligada ao dia selecionado do que ao scroll).
- **Pacote:** `react-native-calendars` (pure JS, compatível com Expo).

### Opção C: Híbrido – react-native-calendars só para “picker” de data
- Usar `Calendar` ou `CalendarList` noutro ecrã/modal para **escolher data** (ex. “ir para 15 Mar”).
- Manter o WeekCarousel na Home para a faixa semanal e a lista de todos do dia.

---

## 7. Exemplo mínimo com react-native-calendars (Opção B)

Se optar por **substituir** o WeekCarousel por um `Calendar` (vista de mês):

```bash
npx expo install react-native-calendars
```

```tsx
import { Calendar } from 'react-native-calendars';

// Construir markedDates a partir de weekSummary (cores por dia)
const markedDates = useMemo(() => {
  const out: Record<string, { customStyles: { container: { backgroundColor: string }; text: { color: string } }; selected?: boolean }> = {};
  weekSummary.forEach((d) => {
    const color = getDayColor(d.date); // sua lógica atual
    out[d.date] = {
      customStyles: {
        container: { backgroundColor: color },
        text: { color: isLight(color) ? '#222' : '#fff' },
      },
      ...(d.date === selectedDate && { selected: true }),
    };
  });
  return out;
}, [weekSummary, selectedDate, selectedCategoryId]);

<Calendar
  current={selectedDate}
  onDayPress={(day) => onDateSelect(day.dateString)}
  markedDates={markedDates}
  markingType="custom"
  firstDay={1}
  onMonthChange={(m) => {
    // opcional: emitir onWeekChange para a 1ª semana do mês
    const start = /* segunda da 1ª semana de m.dateString */;
    const end = /* domingo */;
    onWeekChange(start, end);
  }}
  theme={{
    todayTextColor: colors.orange.base,
    selectedDayBackgroundColor: colors.orange.base,
    selectedDayTextColor: '#fff',
    // ...
  }}
/>
```

- `onWeekChange`: terá de ser adaptado (ex. chamado em `onMonthChange` com a 1ª semana do mês, ou quando `selectedDate` muda, com a semana desse dia).
- Troféu e dot de “hoje”: possíveis com `dayComponent`, mas aumentam a complexidade.

---

**Conclusão:** É possível usar react-native-calendars para um **calendário de mês** com cores e seleção semelhantes, mas **não** para um carrossel de 7 dias com scroll dia a dia e snap à segunda. A escolha depende de querer **manter a UX atual** (Opção A ou C) ou **mudar para vista de mês** (Opção B).
