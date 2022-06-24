import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import "./LineChart.scss"


export default function Tetris() {
  const svgRef = useRef()
  const someWords = [
    "разнообразный",
    "оранжевый",
    'фиолетовый',
    'салатовый',
    'желтоватый',
    'коричневый',
    'розовый',
    'космический',

  ]

  const numberOfRow = 24 //число строк поля тетриса
  const data4canvas = new Array(numberOfRow).fill(new Array(numberOfRow).fill(null)).map((row, indY) => {
    return row.map((el, indX) => ({ x: indX, y: indY })) //матрица с координатами
  })

  useEffect(() => {
    const svgWidth = parseInt(svgRef.current.clientWidth)
    const svgHeight = parseInt(svgRef.current.clientHeight)

    inputWordsInData(someWords, data4canvas) //Вставляет слова data4canvas
    drawTetris(svgWidth, svgHeight, data4canvas) //Рисует canvas на основе data4canvas и размерах canvas
  }, [])

  function inputWordsInData(words, data) {

    //массив объектов, в которых нах. информация о линиях слов
    const wordLines = words.map((word, index) => {
      return ({
        letters: word.split(''),
        startCoord: { x: 0, y: 0 },
        horisontal: (index % 2) ? false : true, //каждое нечетное будет вертикальным
        index: index,
        coords: [],
        breakers: false
      })
    })

    function setCoords(line) {
      if (line.horisontal) {//если слово распологается горизонтально

        line.startCoord.x = Math.floor((numberOfRow - line.letters.length) / 2)
        line.startCoord.y = Math.floor(numberOfRow / 2) + line.index - 4
        line.coords = line.letters.map((item, index) => {
          return [line.startCoord.x + index, line.startCoord.y]
        })


        // console.log(data)
      }
      else {//если слово распологается вертикально
        line.startCoord.x = Math.floor(numberOfRow / 2) + line.index - 4
        line.startCoord.y = Math.floor((numberOfRow - line.letters.length) / 2)
        line.coords = line.letters.map((item, index) => {
          return [line.startCoord.x, line.startCoord.y + index]
        })

      }
    }

    //устанавливаем координаты для ячеек слова
    wordLines.forEach((line) => setCoords(line))







    //проверяем совпадение ячеек
    wordLines.forEach((lineDef, index1) => {

      //где-то здесь ошибка...

      const breakers = []
      wordLines.forEach((lineAtacker, index2) => {
        if ((index1 !== index2) && (index1 < index2)) {

          let breakupSpot = null

          lineAtacker.coords.forEach((coordA, ind) => {
            lineDef.coords.forEach((coordD, spot) => {
              if (coordD[0] === coordA[0]) {
                if (coordD[1] === coordA[1]) {
                  breakupSpot = spot
                }
              }
            })
          })


          //кто и где ломает
          if (breakupSpot) {
            breakers.push({
              index: lineAtacker.index,
              spot: breakupSpot
            })
          }


        }
      })

      lineDef.breakers = breakers


    })


    //разлом слова
    wordLines.forEach((line, ind) => {
      if (line.breakers.length > 0) {
        line.breakers.forEach((breaker, ind) => {
          //добавляем разлом в слове
          line.letters.splice(breaker.spot, 0, '')
          //увеличивем кол-во координат на 1  
          let lastCoords = line.coords[line.coords.length - 1]
          if (line.horisontal) { //увеличиваем x на один
            line.coords.push([lastCoords[0] + 1, lastCoords[1]])
          } else {//увеличиваем y на один
            line.coords.push([lastCoords[0], lastCoords[1] + 1])
          }
        })
      }
    })





    //вставка в дб
    wordLines.forEach((line, ind) => {

      line.letters.forEach((letter, i) => {
        let coords = line.coords[i]
        let y = coords[1]
        let x = coords[0]

        // console.log(x, y, line.letters[i])

        //присвоение каждой букве значения и индекса
        data[y][x].val = letter
        data[y][x].ind = line.index
      })
    })

    console.log(wordLines)
    console.log(someWords)





  }

  //рисует svg
  function drawTetris(width, height, data4canvas) {
    // console.log(data4canvas)
    const size = width / data4canvas.length
    const svg = d3.select(svgRef.current)

    data4canvas.forEach((row, Y) => {
      row.forEach((box, X) => {
        let boxLetter = svg
          .append('g')
          .attr('class', 'rect')


        let rect = boxLetter.append('rect')
          .attr('width', size)
          .attr('height', size)
          .attr('x', box.x * size)
          .attr('y', box.y * size)
          .attr('rx', size / 3)
          .attr('rx', size / 3)
          .attr('class', `rect-${box.ind}`)


        let letter = boxLetter.append('text')
          .text(box.val)
          .attr('x', box.x * size + size / 2)
          .attr('y', box.y * size + size / 1.5)
          .attr('class', 'rect-text')
          .attr('text-anchor', 'middle')
          .style('fill', 'black')


      })
    })
  }







  return (
    <div id="svgBox">
      <svg ref={svgRef}></svg>
    </div>)
}
