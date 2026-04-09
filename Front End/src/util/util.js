export function getCurrentDate(separator=''){

    let newDate = new Date()
    let date = newDate.getDate();
    let month = newDate.getMonth() + 1;
    let year = newDate.getFullYear();
    
    return `${year}${separator}${month<10?`0${month}`:`${month}`}${separator}${date}`
    }

    export function getCurrentDateDDMMYYYY(separator=''){

        let newDate = new Date()
        let date = newDate.getDate();
        let month = newDate.getMonth() + 1;
        let year = newDate.getFullYear();
        
        return `${date}${separator}${month<10?`0${month}`:`${month}`}${separator}${year}`
        }
export function formatDate(dateInput) {
    if (!dateInput) return "N/A";
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return String(dateInput);
    
    const d = date.getDate();
    const m = date.getMonth() + 1;
    const y = date.getFullYear();
    
    return `${d < 10 ? `0${d}` : d}-${m < 10 ? `0${m}` : m}-${y}`;
}
