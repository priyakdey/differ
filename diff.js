// TODO: Right now, we display diff per character, which might not be helpful
// for larger files. Instead, we might need to do a word/line/block diff
// which can help generate hunks.
// For this we might leverage lev distance.

/**
 * Entry point when Find Diff Button is pressed.
 */
function findDiff() {
  const textArea1 = document.getElementById("textarea1");
  const textArea2 = document.getElementById("textarea2");

  const text1 = textArea1.innerText;
  const text2 = textArea2.innerText;


  if ("" === text1 || "" == text2) {
    const errorDisplayDiv = document.getElementById("error-display");
    errorDisplayDiv.innerText = "Please enter text in both fields for comparison.";

    setTimeout(() => errorDisplayDiv.innerText = "", 3000);

    return;
  }

  const lcsMatrix = generateLCSMatrix(text1, text2);
  const { display1, display2 } = generateDiffDisplay(text1, text2, lcsMatrix);

  textArea1.innerHTML = display1;
  textArea2.innerHTML = display2;

}

/**
 * Generate a matrix of LCS
 * @param {String} text1 input text
 * @param {String} text2 input text
 * @returns 2D array of LCS
 */
function generateLCSMatrix(text1, text2) {
  const length1 = text1.length;
  const length2 = text2.length;

  // TODO: replace with typed arrays for performance?

  const lcsMatrix = Array.from({ length: length1 + 1 }, () =>
    new Array(length2 + 1).fill(0)
  );

  // https://github.com/priyakdey/blind-75/blob/main/src/main/java/com/priyakdey/dp/LongestCommonSubsequence.java#L29
  for (let index1 = length1 - 1; index1 >= 0; index1--) {
    for (let index2 = length2 - 1; index2 >= 0; index2--) {
      let length = Math.max(
        lcsMatrix[index1][index2 + 1],
        lcsMatrix[index1 + 1][index2]
      );
      // TODO: add support for utf8. JS string are utf16!!
      if (text1.charAt(index1) === text2.charAt(index2)) {
        length = Math.max(length, 1 + lcsMatrix[index1 + 1][index2 + 1]);
      }
      lcsMatrix[index1][index2] = length;
    }
  }

  return lcsMatrix;
}

/**
 * Generates spans to display the differences of two input text.
 * @param {String} text1 
 * @param {String} text2 
 * @param {Array<Array<Int>>} cache
 * @returns 
 */
function generateDiffDisplay(text1, text2, cache) {
  let index1 = 0;
  let index2 = 0;
  let display1 = "";
  let display2 = "";

  while (index1 < text1.length || index2 < text2.length) {
    if (
      index1 < text1.length &&
      index2 < text2.length &&
      text1[index1] === text2[index2]
    ) {
      // characters are the same in both strings
      display1 += `<span class="unchanged">${text1[index1]}</span>`;
      display2 += `<span class="unchanged">${text2[index2]}</span>`;
      index1++;
      index2++;
    } else if (
      index2 < text2.length &&
      (index1 === text1.length ||
        cache[index1][index2 + 1] >= cache[index1 + 1][index2])
    ) {
      // character in text2 is not in LCS, mark as added
      display2 += `<span class="added">${text2[index2]}</span>`;
      index2++;
    } else if (
      index1 < text1.length &&
      (index2 === text2.length ||
        cache[index1][index2 + 1] < cache[index1 + 1][index2])
    ) {
      // character in text1 is not in LCS, mark as removed
      display1 += `<span class="removed">${text1[index1]}</span>`;
      index1++;
    }
  }

  return { display1, display2 };
}
