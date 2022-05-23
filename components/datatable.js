class DataTable {
    constructor(id) {
        this.id = id;
    }

    update(data, columns) {
        function getCol(matrix, col){
            var column = [];
            for(var i=0; i<matrix.length; i++){
               column.push(matrix[i][col]);
            }
            return column; // return column data..
         }
         function median(numbers) {
            const sorted = Array.from(numbers).sort((a, b) => a - b);
            const middle = Math.floor(sorted.length / 2);
        
            if (sorted.length % 2 === 0) {
                return (sorted[middle - 1] + sorted[middle]) / 2;
            }
        
            return sorted[middle];
        }
        let table = d3.select(this.id);
        
        const mean_obj = {Stat: "Mean"};
        const med_obj = {Stat: "Median"};
        const min_obj = {Stat: "Min"};
        const max_obj = {Stat: "Max"};
        columns.forEach((element, index) => {
            const arr = getCol(data,element);
            mean_obj[element] = parseFloat(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2);
            min_obj[element] = Math.min(...arr)
            max_obj[element] = Math.max(...arr)
            med_obj[element] = median(arr)
          });
      

        const stat_data = [min_obj, mean_obj, med_obj, max_obj];

        let rows = table
            .selectAll("tr")
            .data(stat_data)
            .join("tr");
        
        const disp_cols = ["Stat"].concat(columns);
   
        rows.selectAll("td")
            .data(d => disp_cols.map(c => d[c]))
            .join("td")
            .text(d => d)
    }
}