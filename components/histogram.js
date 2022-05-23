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
        top: 30, right: 40, bottom: 40, left: 40
    }

    constructor(svg, width = 540, height = 240) {
        this.svg = svg;
        this.width = width;
        this.height = height;
    }

    initialize() {
        this.svg = d3.select(this.svg);
        this.container = this.svg.append("g");
        this.xAxis = this.svg.append("g");
        this.yAxis = this.svg.append("g");
        this.legend = this.svg.append("g");

        this.xScale = d3.scaleLinear();
        this.yScale = d3.scaleLinear();
        this.svg
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        this.container.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

    }

    getCol(matrix, col){
        var column = [];
        for(var i=0; i<matrix.length; i++){
           column.push(matrix[i][col]);
        }
        return column; // return column data..
     }

    update(tableData, col_name) {
        
        const domain = [d3.min(tableData, function(d) { return d[col_name]; }),d3.max(tableData, function(d) { return d[col_name]; })];

        this.xScale.domain(domain).range([0, this.width]);

        var histogram = d3.histogram() 
                .value(function(d) { return d[col_name]; }) 
                .domain(this.xScale.domain())  
                .thresholds(this.xScale.ticks(8));

        var bins = histogram(tableData);
     

    
    
        this.yScale.range([this.height, 0]).domain([0, d3.max(bins, function(d) { return d.length; })]);  
        

        this.container.selectAll("rect")
                .data(bins)
                .join("rect")
                .transition()
                .attr("x", 1)
                .attr("transform", d => "translate(" + this.xScale(d.x0) + "," + this.yScale(d.length) + ")")
                .attr("width", d => this.xScale(d.x1) - this.xScale(d.x0)-1 > 0 ? this.xScale(d.x1) - this.xScale(d.x0)-1: this.xScale(d.x1) - this.xScale(d.x0))
                .attr("height", d => this.height  - this.yScale(d.length))
                .style("fill","#FF7F50")

        this.xAxis
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top + this.height})`)
            .call(d3.axisBottom(this.xScale))            


        this.yAxis
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
            .call(d3.axisLeft(this.yScale))
        
    }
}