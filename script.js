const educationDataURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';
const countyDataURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';

Promise.all([d3.json(educationDataURL), d3.json(countyDataURL)])
  .then(([educationData, countyData]) => {
    drawChoropleth(educationData, countyData);
  })
  .catch((error) => console.error('Error fetching data:', error));

function drawChoropleth(educationData, countyData) {
  const svg = d3.select('#choropleth');
  const legend = d3.select('#legend');

  const path = d3.geoPath();

  const colorScale = d3.scaleQuantize()
    .domain(d3.extent(educationData, (d) => d.bachelorsOrHigher))
    .range(d3.schemeBlues[7]);

  svg.selectAll('.counties')
    .data(topojson.feature(countyData, countyData.objects.counties).features)
    .enter()
    .append('path')
    .attr('class', 'counties')
    .attr('data-fips', (d) => d.id)
    .attr('data-education', (d) => {
      const county = educationData.find((c) => c.fips === d.id);
      return county ? county.bachelorsOrHigher : 0;
    })
    .attr('fill', (d) => {
      const county = educationData.find((c) => c.fips === d.id);
      return county ? colorScale(county.bachelorsOrHigher) : colorScale(0);
    })
    .attr('d', path)
    .on('mouseover', handleMouseOver)
    .on('mouseout', handleMouseOut);

  const legendColors = colorScale.range().reverse();
  const legendWidth = 200;
  const legendItemWidth = legendWidth / legendColors.length;

  legend.selectAll('rect')
    .data(legendColors)
    .enter()
    .append('rect')
    .attr('x', (d, i) => i * legendItemWidth)
    .attr('y', 0)
    .attr('width', legendItemWidth)
    .attr('height', 20)
    .attr('fill', (d) => d);

  legend.attr('width', legendWidth)
    .attr('height', 20);

  function handleMouseOver(event, d) {
    const county = educationData.find((c) => c.fips === d.id);
    if (county) {
      const tooltip = d3.select('#tooltip');
      tooltip
        .attr('data-education', county.bachelorsOrHigher)
        .style('visibility', 'visible')
        .style('left', event.pageX + 'px')
        .style('top', event.pageY + 'px')
        .text(`${county.area_name}, ${county.state}: ${county.bachelorsOrHigher}%`);
    }
  }

  function handleMouseOut() {
    d3.select('#tooltip').style('visibility', 'hidden');
  }
}
