import moment from 'moment';

export function headerTitleComponent(date: string | null | undefined): string {
   // Se não há data, retorna padrão
   if (!date) {
      return "Today's";
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
      return "Today's";
   } else if (normalizedDate === yesterday) {
      return "Yesterday's";
   } else if (normalizedDate === tomorrow) {
      return "Tomorrow's";
   } else {
      // Para datas mais distantes, formata como "January 15"
      return moment(normalizedDate).format('MMMM D');
   }
}