import { loadRecords, saveRecords } from "./storage.js";

let records = loadRecords();

function getRecords() {
    return [...records];
}

function addRecord(record) {
    records.push(record);
    if (!saveRecords(records)) {
        records.pop();
        return false;
    }

    return true;
}

function updateRecord(id, updateData) {
    const index = records.findIndex(record => record.id === id);
    if (index === -1) return false;

    const oldRecord = records[index];

    records[index] = {
        ...oldRecord,
        ...updateData,
        id: oldRecord.id,
        createdAt: oldRecord.createdAt,
        updatedAt: new Date().toISOString()
    };

    if (!saveRecords(records)) {
        records[index] = oldRecord;
        return false;
    }

    return true;

}

function deleteRecord(id) {
    const index = records.findIndex(record => record.id === id);

    if (index === -1) return false;

    const removed = records.splice(index, 1)[0];

    if (!saveRecords(records)) {
        records.splice(index, 0, removed);
        return false;
    }

    return true;

}

function replaceRecords(newRecords) {
    const oldRecords = records;
    records = [...newRecords];

    if (!saveRecords(records)) {
        records = oldRecords;
        return false;
    }

    return true;

}

export {
    getRecords,
    addRecord,
    updateRecord,
    deleteRecord,
    replaceRecords
};