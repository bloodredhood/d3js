import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import "./LineChart.scss"
import { words } from './words';


export default function Tetris() {
  const svgRef = useRef()
  // const someWord = [
  //   "correspondent",
  //   "scientific",
  //   "agricultural",
  //   "administration",
  //   "professional",
  //   "intelligence",
  //   "reasonable",
  //   "participation",
  //   "opportunity",
  //   "identification",
  // ]


  //console.log(allOfWords)
  const neededWords = []
  words.forEach(word => {
    // !!!!! ВАЖНО !!!!! разница в длине не должна превышать 4 символов, минимальная длина не больше 11 символов - дальше ячейки становятся очень маленькими для букв и добавлять цвета новые (11-15(только одно слово такой длины) - 10 слов)(10-14 - 9 слов)(9-13 - 8 слов) и т.д. на уменьшение. Не вижу смысла в случае такой схемы менять количество слов, следует придумать новые схемы расположения слов в матрице
    if (word.length >= 10 && word.length <= 14) {
      neededWords.push(word)
    }
  })
  //console.log(neededWords)




  const randomWords = (arr) => {
    const result = []
    const getRandomNum = (max) => {
      return Math.floor(Math.random() * (max - 1) + 1)
    }
    const arrForClip = [...arr]
    const shortestWord = arr.reduce((a, b) => (a.length <= b.length ? a : b))
    for (let i = 0; i < arr.length; i++) {
      if (result.length < shortestWord.length - 1) {
        const word = arrForClip[getRandomNum(arrForClip.length)]
        result.push(word)
        arrForClip.splice(arrForClip.indexOf(word), 1)
      }
    }
    return result
  }

  const someWords = randomWords(neededWords)
  //console.log(someWords)

  const numberOfRow = Math.round(someWords.length / 2) * 6 //число строк поля тетриса, ДЛЯ ИЗБЕЖАНИЯ ОШИБОК ДОЛЖНО БЫТЬ ЧЕТНЫМ!!!!
  const data4canvas = new Array(numberOfRow).fill(new Array(numberOfRow).fill(null)).map((row, indY) => {
    //массив-матрица с массивами(строки) и наполнением строк (ячейки-объекты) в которых row - индекс массива, indY - индекс объекта-ячейки
    return row.map((el, indX) => ({ x: indX, y: indY })) //матрица с координатами
    //в каждый объект-ячейку вписаны ключи координат
  })

  useEffect(() => {
    const svgWidth = parseInt(svgRef.current.clientWidth)
    const svgHeight = parseInt(svgRef.current.clientHeight)

    console.log(someWords)
    inputWordsInData(someWords, data4canvas) //Вставляет слова data4canvas
    //баг ищем здесь. принимаем массив условно-случайных слов и массив-матрицу
    drawTetris(svgWidth, svgHeight, data4canvas) //Рисует canvas на основе data4canvas и размерах canvas
  })

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
        breakers: false,
        //сюда прилетает массив с объектами точек пересечения
        breakersNum: 0
      })
    })



    function setCoords(line) {
      //принимается слово-объект из someWords
      //!!!!! ВАЖНО !!!!! Строки 104-109 и 116-119 нужно переработать для вариативности игры
      if (line.horisontal) {//если слово распологается горизонтально

        line.startCoord.x = Math.floor((numberOfRow / 2 - Math.ceil(line.letters.length / 2))) + 1
        //сверху отступ размером в половину слова
        line.startCoord.y = Math.floor(numberOfRow / 2) + (line.index - (Math.ceil(someWords.length / 2)))
        //задаем стартовую координату по х и у
        line.coords = line.letters.map((item, index) => {
          return [line.startCoord.x + index, line.startCoord.y]
          //назначаем массив-координаты каждой букве в зависимости от положения первого символа и направления слова
        })


        // console.log(data)
      }
      else {//если слово распологается вертикально
        line.startCoord.x = Math.floor(numberOfRow / 2) + (line.index - (Math.ceil(someWords.length / 2))) // стоит пересмотреть фиксированное значение
        line.startCoord.y = Math.floor((numberOfRow / 2 - Math.ceil(line.letters.length / 2)))
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

    wordLines.forEach((line, idx) => {
      if (wordLines.length % 2 === 0) {
        line.breakersNum = Math.floor((wordLines.length - idx) / 2)
      } else if (wordLines.length % 2 !== 0) {
        line.breakersNum = Math.floor((wordLines.length - idx) / 2)
      }
    })

    //console.log(wordLines)

    //проверяем совпадение ячеек
    //нужно менять код 135-198 и полностью переписать логику, чтобы изображение было красивым, выше просто посчитать количество брейкеров

    //const lettersArr = line.letters;
    //const breakNum = line.breakersNum;

    const breakerFunc = (arr, breakersNum) => {

      const spaceStep = [2, 4, 6, 8];
      let maxBreakerNum = Math.floor(wordLines.length / 2)
      let placeChanger = maxBreakerNum - breakersNum

      let firstSpace = (arr, breakNum, placeChan) => {

        if (breakNum === 0) {
          return arr;
        }

        if (wordLines.length % 2 === 0) {
          arr.splice(Math.floor((arr.length - (breakNum - 1)) / 2 + placeChan), 0, '')
        } else if (wordLines.length % 2 !== 0) {
          arr.splice(Math.ceil((arr.length - (breakNum - 1)) / 2 + placeChan), 0, '')
        }

      };

      let multiSpaceAdd = (arr, breakNum, step) => {
        if (breakNum === 0 && breakNum === 1) {
          return arr;
        }
        const spaceAdd = (array, count) => {
          array.splice(arr.indexOf("") + count, 0, "");
        };
        for (let i = 0; i < breakNum; i++) {
          spaceAdd(arr, step[i]);
        }
      };

      firstSpace(arr, breakersNum, placeChanger);
      multiSpaceAdd(arr, breakersNum, spaceStep);
      //увеличивем кол-во координат на 1  

      //console.log(arr)
      return arr
    };

    wordLines.forEach(line => {
      //console.log(line.breakersNum)

      let array = breakerFunc(line.letters, line.breakersNum)
      line.letters = array

    })



    wordLines.forEach(line => {
      if (line.breakersNum > 0) {

        let lastCoords = line.coords[line.coords.length - 1]
        //console.log(lastCoords)
        //переменная, хранящая массив координат последней точки слова-объекта
        const difference = line.letters.length - line.coords.length
        if (line.horisontal) { //увеличиваем x на один
          for (let i = difference; i >= 0; i--) {
            line.coords.push([lastCoords[0] + 1, lastCoords[1]])
          }
        } else {//увеличиваем y на один
          for (let i = difference; i >= 0; i--) {
            line.coords.push([lastCoords[0], lastCoords[1] + 1])
          }
        }
      }})

    console.log(wordLines)

    //вставка в дб
    wordLines.forEach((line, ind) => {

      line.letters.forEach((letter, i) => {

        let coords = line.coords[i]
        let x = coords[0]
        let y = coords[1]

        //console.log(x, y, line.letters[i])

        //присвоение каждой букве значения и индекса
        data[y][x].val = letter
        data[y][x].ind = line.index
        //console.log(data[y][x].val)
      })
      //для каждой буквы
    })
    //console.log(wordLines)
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


        //let rect = 
        boxLetter.append('rect')
          .attr('width', size)
          .attr('height', size)
          .attr('x', box.x * size)
          .attr('y', box.y * size)
          .attr('rx', size / 3)
          .attr('rx', size / 3)
          .attr('class', `rect-${box.ind}`)


        //let letter = 
        boxLetter.append('text')
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
