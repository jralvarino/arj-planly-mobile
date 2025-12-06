import moment from 'moment';

export function headerTitleComponent(date) {
   // Normaliza tudo para "YYYY-MM-DD"
   const today = moment().format('YYYY-MM-DD');
   const yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD');
   const tomorrow = moment().add(1, 'day').format('YYYY-MM-DD');

   let selectedDate = "Today's";

   if (date) {
      if (date === today) {
         selectedDate = "Today's";
      } else if (date === yesterday) {
         selectedDate = "Yesterday's";
      } else if (date === tomorrow) {
         selectedDate = "Tomorrow's";
      } else {
         selectedDate = moment(date).format('MMMM D');
      }
   }

   return selectedDate;
}