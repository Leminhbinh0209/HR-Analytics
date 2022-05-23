class Histogram {
    margin = {
        top: 30, right: 30, bottom: 60, left: 40
    }

    constructor(svg, tooltip, width = 540, height = 240) {
        this.svg = svg;
        this.width = width;
        this.height = height;
        this.tooltip = tooltip;
    }

    initialize() {
        this.svg = d3.select(this.svg);
        this.tooltip = d3.select(this.tooltip);
   
        this.container = this.svg.append("g");
        
        this.xAxis = this.svg.append("g");
        this.yAxis = this.svg.append("g");
        this.legend = this.svg.append("g");

        this.xScale = d3.scaleBand();
        this.yScale = d3.scaleLinear();
        
        this.svg
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        this.container.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);
        
    }



    update(data, xVar) {
        
        const categories = [...new Set(data.map(d => d[xVar]))]
        // Capitalize the string
        const counts = {}
        
  
        categories.forEach(c => {
            counts[c] =  data.filter(d => d[xVar] === c && d["turnover"] === 1).length / data.filter(d => d[xVar] === c).length;
        })
       
        // Step - 1
        // Create the array of key-value pairs
        var items = Object.keys(counts).map(
            (key) => { return [key, counts[key]] });
        // Step - 2
        // Sort the array based on the second element (i.e. the value)
        items.sort(
            (first, second) => { return -first[1] + second[1] }
        );
        var sort_categories = items.map(
            (e) => { return e[0] });

    
        this.xScale.domain(sort_categories).range([0, this.width]).padding(0.3);
        this.yScale.domain([0, d3.max(Object.values(counts))]).range([this.height, 0]);
        
        this.bars = this.container.selectAll("rect")
            .data(sort_categories)
            .join("rect")
            .on("mouseover", (e, d) => {
                this.tooltip.select("#bar-tooltips")
                    .html(`Ratio: ${parseFloat(counts[d]).toFixed(2)}`);

                Popper.createPopper(e.target, this.tooltip.node(), {
                    placement: 'top',
                    modifiers: [
                        {
                            name: 'arrow',
                            options: {
                                element: this.tooltip.select(".tooltip-arrow").node(),
                            },
                        },
                    ],
                });

                this.tooltip.style("display", "block");
            })
            .on("mouseout", (d) => {
                this.tooltip.style("display", "none");
            });
        
        this.bars.transition()
            .attr("x", d => this.xScale(d))
            .attr("y", d => this.yScale( counts[d]))
            .attr("width", this.xScale.bandwidth())
            .attr("height", d => this.height - this.yScale(counts[d]))
            .attr("fill", "#008282")
  
        this.xAxis
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top + this.height})`)
            .call(d3.axisBottom(this.xScale))
            .append("text")            
            .attr("y", this.height - this.height+30)
            .attr("x", this.width - 270)
            .attr("text-anchor", "end")
            .attr("fill", "blue")            
            .style("font-size", "1.1em")
            .text("Department");

        this.yAxis
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
            .call(d3.axisLeft(this.yScale))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 12)
            .attr("x", -58)
            .attr("dy", "-4em")
            .attr("text-anchor", "end")
            .attr("fill", "blue")
            .style("font-size", "1.1em")
            .text("Turnover ratio");
    }
}

class BinHistogram {
    margin = {
        top: 30, right: 80, bottom: 40, left: 40
    }

    constructor(svg, width = 540, height = 240) {
        this.svg = svg;
        this.width = width;
        this.height = height;
    }

    initialize() {
        this.svg = d3.select(this.svg);
        this.container = this.svg.append("g");
        this.container2 = this.svg.append("g");
        
        this.xAxis = this.svg.append("g");
        this.yAxis = this.svg.append("g");
        this.legend = this.svg.append("g");

        this.legend1 = this.svg.append("rect")
        this.legend2 = this.svg.append("rect")

        this.legendtext1 = this.svg.append("text")
        this.legendtext2 = this.svg.append("text")

        this.xScale = d3.scaleLinear();
        this.yScale = d3.scaleLinear();
  
        this.svg
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        this.container.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);
        this.container2.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

    }

    getCol(matrix, col){
        var column = [];
        for(var i=0; i<matrix.length; i++){
           column.push(matrix[i][col]);
        }
        return column; // return column data..
    }
    calculate_bins(arr, lb_arr, n_bins){
        const domain =  [Math.min(...arr),Math.max(...arr)];

        var bins = [];
        var x_sticks = [];
        var binCount = 0;
        var interval =(domain[1] - domain[0]) / n_bins;
        var numOfBuckets = n_bins;
      
        //Setup Bins
        for(var i = domain[0]; i < domain[1]; i += interval){
            bins.push({
            binNum: binCount,
            x0: i,
            x1: i + interval,
            pos_length: 0, 
            neg_length: 0
            });
            x_sticks.push(parseFloat(i+interval/2).toFixed(3));
            binCount++;
        
        }
  
        var tmp_cnt = 0;
        var max_count = 0;
        for (var i = 0; i < arr.length; i++){
            var item = arr[i];
            var lb = lb_arr[i]
            var idicator = 0;
            for (var j = 0; j < bins.length; j++){
                var bin = bins[j];
                var bot = bin.x0;
                var top = j < bins.length-1 ? bin.x1 :  bin.x1 + 1; // Increase an epsilon for ensure the upper bound included
                if(item >= bot&& item < top){
                    idicator = 1;
                    tmp_cnt += 1;
                    if(lb > 0){
                        bin.pos_length += 1; 
                    }                        
                    else {
                        bin.neg_length += 1; 
                    }
                    max_count = bin.neg_length +bin.pos_length> max_count ? bin.neg_length+bin.pos_length : max_count;
                    break;  // An item can only be in one bin.
                }
            }  
            if (idicator === 0){
                console.log("Cannot found for: ", item)
                return [bins, max_count];
            }
        }
        return [bins, max_count, x_sticks];
    }
    update(tableData, col_name) {
        
        const domain = [d3.min(tableData, function(d) { return d[col_name]; }),d3.max(tableData, function(d) { return d[col_name]; })];
  
        this.xScale.domain(domain).range([0, this.width]);
        var arr = this.getCol(tableData, col_name)
        var turover_array = this.getCol(tableData, "turnover")
        var n_bins = 12;
        if (col_name === "satisfaction_level" | col_name==="time_spend_company"){ n_bins=8;}
        var binsandcount = this.calculate_bins(arr, turover_array, n_bins);
        var bins = binsandcount[0];
        var max_count = binsandcount[1];
        var x_sticks  = binsandcount[2];
        this.yScale.range([this.height, 0]).domain([0, max_count]);  

        this.container.selectAll("rect")
                .data(bins)
                .join("rect")
                .transition()
                .attr("x", 1)
                .attr("transform", d => "translate(" + this.xScale(d.x0) + "," + this.yScale(d.pos_length) + ")")
                .attr("width", d => this.xScale(d.x1) - this.xScale(d.x0)-1 )
                .attr("height", d => this.height  - this.yScale(d.pos_length))
                .style("fill", "#FF7F50")

        this.container2.selectAll("rect")
                .data(bins)
                .join("rect")
                .transition()
                .attr("x", 1)
                .attr("transform", d => "translate(" + this.xScale(d.x0) + "," + this.yScale(d.neg_length + d.pos_length) + ")")
                .attr("width", d => this.xScale(d.x1) - this.xScale(d.x0)-1 )
                .attr("height", d => this.height  - this.yScale(d.neg_length))
                .style("fill", "#008282")

        this.yAxis
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
            .call(d3.axisLeft(this.yScale))


        this.xAxis
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top + this.height})`)
            .call(d3.axisBottom(this.xScale).tickValues(x_sticks)) 


        this.legend2
                .attr("transform", `translate(${this.margin.left+this.width+5}, ${this.margin.top + this.height/4})`)
                .attr("width",25 )
                .attr("height",25)
                .style("fill", "#FF7F50")
        this.legend1
                .attr("transform", `translate(${this.margin.left+this.width+5}, ${this.margin.top + this.height/4+30})`)
                .attr("width", 25)
                .attr("height", 25)
                .style("fill", "#008282")

        this.legendtext1
                    .attr("x", 0)
                    .attr("transform", `translate(${this.margin.left+this.width+34}, ${this.margin.top + this.height/4+14})`)
                    .attr("y", 0).text("Left").style("font-size", "15px").attr("alignment-baseline","middle")
        this.legendtext2
                .attr("transform", `translate(${this.margin.left+this.width+34}, ${this.margin.top + this.height/4+44})`)
                .attr("x", 0).attr("y", 0).text("Stay").style("font-size", "15px").attr("alignment-baseline","middle")


    }
}