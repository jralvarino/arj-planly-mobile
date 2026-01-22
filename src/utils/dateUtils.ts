import moment from 'moment';

export function getTodayDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function headerTitleComponent(date: string | null | undefined): string {
   // Se não há data, retorna padrão
   if (!date) {
      return "Today";
   }

   // Normaliza a data de entrada para "YYYY-MM-DD" usando timezone local
   // Se a data vier como string no formato ISO (com timezone), precisamos tratá-la corretamente
   const normalizedDate = moment(date).format('YYYY-MM-DD');
   
   // Calcula as datas relativas usando o timezone local do dispositivo
   const now = moment();
   const today = now.format('YYYY-MM-DD');
   const yesterday = now.clone().subtract(1, 'day').format('YYYY-MM-DD');
   const tomorrow = now.clone().add(1, 'day').format('YYYY-MM-DD');

   // Compara as datas normalizadas (comparação exata de strings)
   if (normalizedDate === today) {
      return "Today";
   } else if (normalizedDate === yesterday) {
      return "Yesterday";
   } else if (normalizedDate === tomorrow) {
      return "Tomorrow";
   } else {
      // Para datas mais distantes, formata como "January 15"
      return moment(normalizedDate).format('MMMM D');
   }
}