
export const formatDateForInput = (date) => {
    if (!date || Number.isNaN(new Date(date).getTime())) {
        return "";
    }

    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

export const calculateDueDate = (invoiceDate, terms) => {
    if (!invoiceDate) return "";

    const [year, month, day] = invoiceDate
        .slice(0, 10)
        .split("-")
        .map(Number);

    const date = new Date(year, month - 1, day);

    switch (terms) {
        case "Net 15":
            date.setDate(date.getDate() + 15);
            break;

        case "Net 30":
            date.setDate(date.getDate() + 30);
            break;

        case "Due on Receipt":
        default:
            break;
    }

    return formatDateForInput(date);
};
