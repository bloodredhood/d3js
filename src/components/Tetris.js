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
    'testword'
  ]

  const numberOfRow = 24 //число строк поля тетриса
  const data4canvas = new Array(numberOfRow).fill(new Array(numberOfRow).fill(null)).map((row, indY) => {
    //массив-матрица с массивами(строки) и наполнением строк (ячейки-объекты) в которых row - индекс массива, indY - индекс объекта-ячейки
    return row.map((el, indX) => ({ x: indX, y: indY })) //матрица с координатами
    //в каждый объект-ячейку вписаны ключи координат
  })

  useEffect(() => {
    const svgWidth = parseInt(svgRef.current.clientWidth)
    const svgHeight = parseInt(svgRef.current.clientHeight)

    inputWordsInData(someWords, data4canvas) //Вставляет слова data4canvas
    //баг ищем здесь. принимаем массив условно-случайных слов и массив-матрицу
    drawTetris(svgWidth, svgHeight, data4canvas) //Рисует canvas на основе data4canvas и размерах canvas
  }, [])

  function inputWordsInData(words, data) {
    //принимаем данные из массива someWords и матрицы для заполнения data4canvas, где words - массив условно-случайных слов, data - массив-матрица
    //массив объектов, в которых нах. информация о линиях слов
    const wordLines = words.map((word, index) => {
      //создаем на основе массива условно-случайных слов новый массив, хранящий в виде объектов слова с разделитями '' для внедрения их в массив-матрицу
      return ({
        letters: word.split(''),
        //массив, в котором элементами-строками переданы буквы, включая места выталкивания букв '' между буквами
        startCoord: { x: 0, y: 0 },
        //место в матрице согласно координатам, где разположена первая буква
        horisontal: (index % 2) ? false : true, //каждое нечетное будет вертикальным
        //проверка на направление слова в матрице: четные горизонтальные
        index: index,
        //положение слова во входном условно-случнайном массиве
        coords: [],
        //массив координат слова по матрице - горизонталь и вертикаль
        breakers: false
        //сюда прилетает массив с объектами точек пересечения 
      })
    })

    //console.log(wordLines)

    function setCoords(line) {
      //принимается слово-объект
      if (line.horisontal) {//если слово распологается горизонтально

        line.startCoord.x = Math.floor((numberOfRow - line.letters.length) / 2)
        line.startCoord.y = Math.floor(numberOfRow / 2) + line.index - 4 // стоит пересмотреть фиксированное значение
        //задаем стартовую координату по х и у
        line.coords = line.letters.map((item, index) => {
          return [line.startCoord.x + index, line.startCoord.y]
          //назначаем массив-координаты каждой букве в зависимости от положения первого символа и направления слова
        })


        // console.log(data)
      }
      else {//если слово распологается вертикально
        line.startCoord.x = Math.floor(numberOfRow / 2) + line.index - 4 // стоит пересмотреть фиксированное значение
        line.startCoord.y = Math.floor((numberOfRow - line.letters.length) / 2)
        //задаем стартовую координату по х и у
        line.coords = line.letters.map((item, index) => {
          return [line.startCoord.x, line.startCoord.y + index]
          //назначаем массив-координаты каждой букве в зависимости от положения первого символа и направления слова
        })

      }
    }

    //устанавливаем координаты для ячеек слова
    wordLines.forEach((line) => setCoords(line))
    //line - объект-слово из измененного массива условно-случайных слов
    //исполняя функцию задаем координаты каждому объекту-букве для позиционирования в массиве-матрице





    //проверяем совпадение ячеек
    wordLines.forEach((lineDef, index1) => {
      //lineDef - объект-слово измененного массива условно-случайных слов


      //где-то здесь ошибка...

      const breakers = []
      //массив, хранящий на каждую итерацию объекты мест пересечения слов {index: индекс слова в массиве объектов-слов, которое в пересекло слово текущей итерации, spot: место-индекс элемента пересечения из массива coords текущей итерации}
      wordLines.forEach((lineAtacker, index2) => {
      //lineAtacker - объект-слово измененного массива условно-случайных слов
        if ((index1 !== index2) && (index1 < index2)) {
          //слово не должно сравниваться с самим собой и при этом индекс каждого следующего слова должен быть больше (сразу итерации над первым словом со всеми последующими, затем со вторым исключая проверку первого, третьим - первого и второго...) 
          let breakupSpot = null

          lineAtacker.coords.forEach((coordA) => {
            lineDef.coords.forEach((coordD, spot) => {
              //перебериаем массивы с координатами внутри объекта-слова
              if (coordD[0] === coordA[0] && coordD[1] === coordA[1]) {
                breakupSpot = spot
                //console.log(breakupSpot)
                //если при переборе массивов будут найдены совпадающие х и у координаты, то они будут записаны в переменную
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
          //если в этой итерации есть совпадение, то в массив прилетает объект точки пересечения

        }
      })

      lineDef.breakers = breakers
      //присвоение массива объектов точек пересечения в объект-слово

    })
    //каждая итерация цикла приурочена к объекту-слову по очереди, каждая итерация получает массив с точками пересечения и отправляет их в объект слово



    //ошибка точно здесь или ниже!!!!!
    //разлом слова
    wordLines.forEach((line, ind) => {
      if (line.breakers.length > 0) {
        line.breakers.forEach((breaker, ind) => {
          //добавляем разлом в слове
          line.letters.splice(breaker.spot, 0, '')
          //увеличивем кол-во координат на 1  
          let lastCoords = line.coords[line.coords.length - 1]
          //переменная, хранящая массив координат последней точки слова-объекта
          if (line.horisontal) { //увеличиваем x на один
            line.coords.push([lastCoords[0] + 1, lastCoords[1]])
          } else {//увеличиваем y на один
            line.coords.push([lastCoords[0], lastCoords[1] + 1])
          }
        })
      }
      //если длина массива объектов точек пересечения > 0, для каждой точки-объекта пересечения добавляем разлом(пустую строку) в массив букв letters
      //и если объект слово горизонтальное в массив координат добавляем массив координат еще одной точки по горизонтали (то же для вертикали)
    })

    
    //вставка в дб
    wordLines.forEach((line, ind) => {

      line.letters.forEach((letter, i) => {
        
        let coords = line.coords[i]
        let x = coords[0]
        let y = coords[1]

        // console.log(x, y, line.letters[i])

        //присвоение каждой букве значения и индекса
        //???????????????????????????????????????????????? что здесь?
        data[y][x].val = letter
        data[y][x].ind = line.index
      })
      //для каждой буквы
    })
    console.log(wordLines)
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
