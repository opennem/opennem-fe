<template>
  <span :id="idName" @click="generate">
    <slot>CSV</slot>
  </span>
</template>

<script>
/* eslint-disable */
import download from 'downloadjs';
import * as moment from 'moment';

export default {
  props: {
    type: {
      type: String,
      default: 'csv',
    },
    // Json to download
    data: {
      type: Array,
      required: true,
    },
    // fields inside the Json Object that you want to export
    // if no given, all the properties in the Json are exported
    fields: {
      type: Object,
      required: true,
    },
    // Title for the data
    title: {
      default: null,
    },
    name: {
      type: String,
      default: 'data.csv',
    },
    meta: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    // unique identifier
    idName() {
      const now = new Date().getTime();
      return `export_${now}`;
    },
  },
  methods: {
    generate() {
      if (!this.data.length) {
        return;
      }
      const json = this.getProcessedJson(this.data, this.fields);

      return this.export(this.jsonToCSV(json), this.name, 'application/csv');
    },
    /*
      Use downloadjs to generate the download link
    */
    export(data, filename, mime) {
      const blob = this.base64ToBlob(data, mime);
      download(blob, filename, mime);
    },
    /*
      jsonToCSV
      ---------------
      Transform json data into an CSV file.
    */
    jsonToCSV(data) {
      let csvData = '';
      if (this.title != null) {
        if (Array.isArray(this.title)) {
          for (let i = 0; i < this.title.length; i += 1) {
            csvData += `${this.title[i]}\r\n`;
          }
        } else {
          csvData += `${this.title}\r\n`;
        }
      }
      for (let key in data[0]) {
        csvData += key + ',';
      }
      csvData = csvData.slice(0, csvData.length - 1);
      csvData += '\r\n';
      data.map((item) => {
        for (let key in item) {
          let escapedCSV = item[key] + ''; // cast Numbers to string
          if (escapedCSV.match(/[,"\n]/)) {
            escapedCSV = '"' + escapedCSV.replace(/\"/g, '""') + '"';
          }
          csvData += escapedCSV + ',';
        }
        csvData = csvData.slice(0, csvData.length - 1);
        csvData += '\r\n';
      });
      return csvData;
    },
    /*
		getProcessedJson
		---------------
		Get only the data to export, if no fields are set return all the data
		*/
    getProcessedJson(data, header) {
      let keys = this.getKeys(data, header);
      let newData = [];
      let _self = this;
      data.map((item, index) => {
        let newItem = {};
        for (let label in keys) {
          let property = keys[label];
          let value = _self.getNestedData(property, item);
          
          if (value === undefined) {
            if (label.includes('Temperature') || label.includes('Trading Price')) {
              value = '';
            } else {
              value = 0;
            }
          }
          if (value === null) {
            value = '';
          } 

          if (property === 'date') {
            value = moment(value).format('YYYY-MM-DD HH:mm');
          }

          newItem[label] = value;
        }
        newData.push(newItem);
      });

      return newData;
    },
    getKeys(data, header) {
      if (header) {
        return header;
      }
      let keys = {};
      for (let key in data[0]) {
        keys[key] = key;
      }
      return keys;
    },
    getNestedData(key, item) {
      let valueFromNestedKey = null;
      let keyNestedSplit = key.split('.');
      valueFromNestedKey = item[keyNestedSplit[0]];
      for (let j = 1; j < keyNestedSplit.length; j++) {
        valueFromNestedKey = valueFromNestedKey[keyNestedSplit[j]];
      }
      return valueFromNestedKey;
    },
    base64ToBlob(data, mime) {
      let base64 = window.btoa(window.unescape(encodeURIComponent(data)));
      let bstr = atob(base64);
      let n = bstr.length;
      let u8arr = new Uint8ClampedArray(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    }
  }
};
</script>

