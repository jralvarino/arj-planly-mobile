# Padrões MVVM e Arquitetura - Planly

Este projeto utiliza o padrão **MVVM (Model-View-ViewModel)** para organizar o código React Native.

## Estrutura de Pastas

```
src/
├── api/              # Cliente HTTP (Axios)
├── components/       # View - Componentes React Native
├── models/           # Model - Interfaces e tipos TypeScript
├── service/          # Camada de serviços (chamadas à API)
├── stores/           # Estado global (Zustand)
├── viewmodels/       # ViewModel - Hooks customizados
├── interfaces/       # Interfaces TypeScript adicionais
├── theme/            # Tema e cores
└── utils/            # Funções utilitárias
```

## Padrão MVVM

### Model (Modelos)

- Localização: `src/models/`
- Responsabilidade: Definir estruturas de dados e tipos
- Exemplo: `Todo.ts`, `Category.ts`, `Habit.ts`

```typescript
// ✅ GOOD - Model bem definido
export interface Todo {
    id: string;
    title: string;
    status: TodoStatus;
    // ...
}

// ❌ BAD - Não misturar lógica de negócio no Model
export interface Todo {
    // ...
    calculateProgress(): number; // ❌ Lógica deve estar no ViewModel
}
```

### View (Componentes)

- Localização: `src/components/` e `src/app/`
- Responsabilidade: Renderização e interação do usuário
- **NÃO deve conter lógica de negócio**

```typescript
// ✅ GOOD - Componente puro que usa ViewModel
export function TodoCard({ todo, onToggle }: TodoCardProps) {
    return <Pressable onPress={() => onToggle(todo.id)}>...</Pressable>;
}

// ❌ BAD - Lógica de negócio no componente
export function TodoCard({ todo }: TodoCardProps) {
    const [todos, setTodos] = useState([]);
    const fetchTodos = async () => { /* ... */ }; // ❌ Deve estar no ViewModel
}
```

### ViewModel (Hooks Customizados)

- Localização: `src/viewmodels/`
- Nomenclatura: `useXxxViewModel.ts`
- Responsabilidade: Gerenciar estado, lógica de negócio e comunicação com services

```typescript
// ✅ GOOD - ViewModel estruturado
export function useTodoViewModel() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchTodos = useCallback(async (date: string) => {
        setLoading(true);
        try {
            const data = await getTodosByDate(date);
            setTodos(data);
        } catch (err) {
            // Tratamento de erro
        } finally {
            setLoading(false);
        }
    }, []);

    return { todos, loading, fetchTodos };
}
```

**Regras para ViewModels:**

- ✅ Usar `useCallback` para funções expostas
- ✅ Gerenciar estados de loading, error, data
- ✅ Fazer chamadas a services (não diretamente à API)
- ✅ Implementar optimistic updates quando apropriado
- ✅ Retornar objeto com estado e funções
- ❌ Não fazer renderização (isso é responsabilidade da View)
- ❌ Não acessar diretamente `planlyApiClient` (usar services)

### ViewModels para Modais

Quando criar modais complexos (especialmente `BottomSheetModal`), criar um ViewModel dedicado para gerenciar a lógica e estado do modal.

```typescript
// ✅ GOOD - ViewModel para modal
interface UseXxxModalViewModelProps {
    modalRef: React.RefObject<BottomSheetModal>;
    initialValue: string;
    onConfirm: (value: string) => void;
    onDismiss?: () => void;
}

export function useXxxModalViewModel({ modalRef, initialValue, onConfirm, onDismiss }: UseXxxModalViewModelProps) {
    const [tempValue, setTempValue] = useState(initialValue);

    const handleDismiss = useCallback(() => {
        const ref = modalRef.current as any;
        if (ref?.dismiss) ref.dismiss();
        onDismiss?.();
    }, [modalRef, onDismiss]);

    const handleConfirm = useCallback(() => {
        onConfirm(tempValue);
        handleDismiss();
    }, [tempValue, onConfirm, handleDismiss]);

    return { tempValue, handleDismiss, handleConfirm };
}
```

**Regras para ViewModels de Modais:**

- ✅ Criar ViewModel separado quando o modal tem lógica complexa ou múltiplos estados
- ✅ Gerenciar estado temporário no ViewModel (valores antes de confirmar)
- ✅ Expor funções `handleDismiss` e `handleConfirm` do ViewModel
- ✅ Receber `modalRef`, valores iniciais e callbacks como props
- ✅ Usar `useCallback` para todas as funções expostas
- ❌ Não colocar lógica de negócio no componente do modal
- ❌ Não gerenciar estado do modal diretamente no componente pai

### Service (Serviços)

- Localização: `src/service/`
- Responsabilidade: Abstrair chamadas à API
- Nomenclatura: `xxx.service.ts`

```typescript
// ✅ GOOD - Service que abstrai chamadas HTTP
export const getTodosByDate = async (date: string): Promise<Todo[]> => {
    const { data } = await planlyApiClient.get<Todo[]>(`/todo/date?date=${date}`);
    return data || [];
};

// ❌ BAD - Lógica de negócio no service
export const getTodosByDate = async (date: string): Promise<Todo[]> => {
    const { data } = await planlyApiClient.get<Todo[]>(`/todo/date?date=${date}`);
    return data.filter((t) => t.active); // ❌ Filtros devem estar no ViewModel
};
```

**Regras para Services:**

- ✅ Apenas chamadas HTTP e transformação de dados da API
- ✅ Retornar tipos bem definidos (`Promise<T>`)
- ✅ Usar `planlyApiClient` para requisições
- ❌ Não gerenciar estado React
- ❌ Não conter lógica de negócio complexa

## Padrões Adicionais

### Estado Global (Stores)

- Localização: `src/stores/`
- Tecnologia: Zustand
- Uso: Apenas para estado que precisa ser compartilhado entre múltiplas telas

```typescript
// ✅ GOOD - Store para estado global
export const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: false,
    checkAuthStatus: async () => { /* ... */ },
}));
```

### API Client

- Localização: `src/api/planly-api.ts`
- **Não deve ser usado diretamente nos componentes ou ViewModels** — sempre usar services

### Tratamento de Erros

- ✅ Usar `Toast.show()` para erros do usuário
- ✅ Logar erros no console para debug
- ✅ Implementar fallback/rollback em optimistic updates

```typescript
// ✅ GOOD - Tratamento de erro completo
try {
    await updateTodoStatus(todoId, status);
} catch (err) {
    console.error("Error updating todo:", err);
    setTodos(prevTodos => /* rollback */);
    Toast.show({ type: "error", text1: "Error", text2: err instanceof Error ? err.message : "Failed to update" });
}
```

### Optimistic Updates

- ✅ Atualizar UI imediatamente
- ✅ Fazer chamada à API em background
- ✅ Reverter em caso de erro
- ✅ Sincronizar com backend após sucesso

```typescript
// ✅ GOOD - Optimistic update com rollback
const handleToggle = async (todoId: string) => {
    setTodos((prev) => prev.map((t) => (t.id === todoId ? { ...t, status: newStatus } : t)));
    updateTodoStatus(todoId, newStatus)
        .then(() => fetchTodos())
        .catch(() => setTodos((prev) => prev.map((t) => (t.id === todoId ? { ...t, status: oldStatus } : t))));
};
```

### Memoização

- ✅ Usar `useCallback` para funções em ViewModels
- ✅ Usar `useMemo` para cálculos custosos
- ✅ Usar `useRef` para valores que não causam re-render

### Componentes de Ícones SVG

- Localização: `src/components/icons/`
- Nomenclatura: `IconXxx.tsx` (ex: `IconCheck.tsx`)

```typescript
// ✅ GOOD - Componente de ícone SVG
export function IconCheck({ size = 24, color = colors.success }: { size?: number; color?: string }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" style={{ alignItems: "center", justifyContent: "center" }}>
            <Path d="..." fill={color} />
        </Svg>
    );
}
```

**Regras para Ícones SVG:**

- ✅ Um componente por ícone SVG, usando `react-native-svg`
- ✅ Props `size` (padrão: 24) e `color` (padrão: cor semântica)
- ✅ `viewBox="0 0 24 24"`, nomear como `IconXxx`, localizar em `src/components/icons/`
- ❌ Não usar `Image` com `.svg` — não funciona no React Native
- ❌ Não criar componente genérico `Icon` com múltiplos ícones

## Convenções de Código

### Nomenclatura

- **ViewModels**: `useXxxViewModel.ts`
- **Services**: `xxx.service.ts`
- **Models**: `Xxx.ts`
- **Components**: `Xxx.tsx`
- **Icons**: `IconXxx.tsx` em `src/components/icons/`

### Imports

- ✅ Usar paths absolutos com `@/` quando configurado
- ✅ Agrupar: externos → internos → relativos

### TypeScript

- ✅ Sempre tipar props de componentes
- ✅ Usar interfaces para estruturas de dados
- ✅ Evitar `any` — usar `unknown` quando necessário

## Gerenciamento de Cores

### Sistema de Cores Centralizado

- Localização: `src/theme/colors.ts`
- **TODAS as cores devem ser importadas deste arquivo**
- ❌ **NUNCA usar cores hardcoded** (hex codes, rgb, rgba, "white", "black", etc.)

```typescript
// ✅ GOOD
import { colors } from "@/theme/colors";
const styles = StyleSheet.create({
    button: { backgroundColor: colors.primary, color: colors.white },
    overlay: { backgroundColor: colors.overlay.black },
});

// ❌ BAD
const styles = StyleSheet.create({
    button: { backgroundColor: "#6D62E1", color: "white" },
    overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
});
```

### Categorias de Cores Disponíveis

- **Principais**: `primary`, `primaryLight`, `habitDefault`
- **Texto**: `text.title`, `text.body`
- **Fundo**: `background`, `tabBar`, `white`, `black`
- **Cinza**: `gray[50]`, `gray[100]`, `gray[200]`, `gray[300]`
- **Semânticas**: `success`, `error`, `warning.{light,base,medium,dark,text}`
- **Overlays**: `overlay.white`, `overlay.white90`, `overlay.black`, `overlay.backdrop`
- **Sombras**: `shadow`, `textShadow`
- **Toast**: `toast.success`, `toast.info`, `toast.error`
- **Outras**: `orange`, `gold`

### Regras para Cores

- ✅ Sempre importar `colors` de `@/theme/colors`
- ✅ Usar cores semânticas (`colors.success`, `colors.error`, `colors.warning.base`)
- ❌ NUNCA usar hex diretamente, strings literais, `rgba()` ou `rgb()` — adicionar ao `colors.ts` se necessário

## Padrões de UI e Espaçamento

### Cards e Seções

```typescript
// ✅ GOOD - Padrão de espaçamento de cards
sectionCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 20,
    marginBottom: 16,
},
```

- ✅ `paddingTop: 12`, `paddingBottom: 20`, `paddingHorizontal: 20`, `marginBottom: 16`
- ❌ Não usar `padding: 20` uniforme quando precisar de controle fino vertical

## Padrões de Modais (BottomSheetModal)

### Estrutura do Modal

```typescript
// ✅ GOOD
<BottomSheetModal
    ref={modalRef}
    snapPoints={snapPoints}
    enablePanDownToClose={true}
    backgroundStyle={styles.modalBackground}
    handleIndicatorStyle={styles.modalIndicator}
    onDismiss={handleClose}
    backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} onPress={handleClose} />
    )}
>
    <BottomSheetView style={styles.modalContent}>
        {/* Conteúdo */}
    </BottomSheetView>
</BottomSheetModal>
```

### Header do Modal

```typescript
// ✅ GOOD
<View style={styles.modalHeader}>
    <Pressable onPress={handleCancel} style={styles.modalCancelButton}>
        <Text style={styles.modalCancelText}>Cancel</Text>
    </Pressable>
    <Text style={styles.modalTitle}>Modal Title</Text>
    <Pressable onPress={handleDone} style={styles.modalDoneButton}>
        <Text style={styles.modalDoneText}>Done</Text>
    </Pressable>
</View>
```

### Estilos Padrão de Modal

```typescript
modalBackground: { backgroundColor: colors.gray[100] },
modalIndicator: { backgroundColor: colors.gray[200], width: 40, height: 4 },
modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, paddingTop: 0 },
modalTitle: { fontSize: 18, fontWeight: "700", color: colors.text.title, flex: 1, textAlign: "center" },
modalCancelButton: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
modalCancelText: { fontSize: 12, fontWeight: "600", color: colors.white },
modalDoneButton: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
modalDoneText: { fontSize: 12, fontWeight: "600", color: colors.white },
```

### Nomenclatura de Estilos de Modal

Prefixo: `{modalName}Modal` → ex: `notesModal`, `unitModal`, `goalModal`

Sufixos: `Header`, `CancelButton`, `CancelText`, `DoneButton`, `DoneText`, `Title`, `Background`, `Content`

- ✅ Texto dos botões: "Cancel" e "Done"
- ❌ Não usar "Close" ou "Save"

## Checklist ao Criar Nova Feature

- [ ] Model criado em `src/models/`
- [ ] Service criado em `src/service/` (se precisar de API)
- [ ] ViewModel criado em `src/viewmodels/` com hook `useXxxViewModel`
- [ ] Componente criado em `src/components/` (se reutilizável) ou `src/app/` (se tela)
- [ ] ViewModel gerencia todo o estado e lógica
- [ ] Componente apenas renderiza e chama funções do ViewModel
- [ ] Tratamento de erros implementado
- [ ] Loading states implementados
- [ ] Optimistic updates quando apropriado
