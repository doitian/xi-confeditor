package com.sanpj.pets.confeditor.repo

import org.apache.poi.ss.usermodel.*
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.lang.NumberFormatException


class ExcelRow(val row: Int) {
    val columns = HashMap<String, String>()
}

class ExcelFile(val name: String) {
    var firstRowNum: Int = 7
    var nextRowNum: Int = 7
    var rows = ArrayList<ExcelRow>()
    val columnsPosition = HashMap<String, Int>()
    val columnsTitle = HashMap<String, String>()
}

class ExcelFileChanges(var name: String? = null) {
    val rows = ArrayList<ExcelRow>()
}

class ExcelRepo(val confDirectory: String) {
    var files = HashMap<String, ExcelFile>()
    val dataFormatter = DataFormatter()

    suspend fun get(name: String): ExcelFile? {
        var file = files[name]
        if (file == null) {
            file = read(name)
            if (file != null) {
                files[name] = file
            }
        }

        return file
    }

    suspend fun save(changes: ExcelFileChanges): ExcelFileChanges? {
        val name = changes.name!!
        val file = get(name)
        if (file == null) {
            return null
        }

        val excelFile = findExcelFile(name)
        if (excelFile == null) {
            return null
        }

        val workbook  = WorkbookFactory.create(excelFile)
        val sheet = workbook.getSheetAt(0)

        for (changedRow in changes.rows) {
            val rowNum = changedRow.row - 1
            val row = sheet.getRow(rowNum) ?: sheet.createRow(rowNum)
            for (pair in changedRow.columns) {
                val colNum = file.columnsPosition[pair.key]
                if (colNum != null) {
                    val cell = row.getCell(colNum) ?: row.createCell(colNum)
                    when (cell.cellTypeEnum) {
                        CellType.NUMERIC -> {
                            try {
                                cell.setCellValue(pair.value.toDouble())
                            } catch (_: NumberFormatException) {
                                cell.setCellValue(pair.value)
                            }
                        }
                        else -> {
                            cell.setCellValue(pair.value)
                        }
                    }
                }
            }
        }

        saveExcel(workbook, excelFile)
        file.rows = applyChanges(file.rows, changes.rows)

        return changes
    }

    fun clear() {
        files.clear()
    }

    suspend fun read(name: String): ExcelFile? {
        val excelFile = findExcelFile(name) ?: return null

        val workbook  = WorkbookFactory.create(excelFile)
        val sheet = workbook.getSheetAt(0)

        val file = ExcelFile(name)
        parseConfig(file, sheet)
        readRows(file, sheet)

        return file
    }

    fun findExcelFile(name: String): File? {
        return arrayOf(
                File(confDirectory, name + ".xlsx"),
                File(confDirectory, name + ".xls")
        ).find { it.exists() }
    }

    @Throws(IOException::class)
    private fun saveExcel(workbook: Workbook, file: File) {
        val out = ByteArrayOutputStream()
        workbook.write(out)
        val fout = FileOutputStream(file)
        fout.write(out.toByteArray())
        fout.close()
    }

    private fun parseConfig(file: ExcelFile, sheet: Sheet) {
        val firstRowNum = sheet.firstRowNum
        val keyRow = sheet.getRow(firstRowNum)!!
        val valueRow = sheet.getRow(firstRowNum + 1)!!
        val colNameRow = sheet.getRow(firstRowNum + 2)!!

        var titleRow : Row? = null

        for (i in keyRow.firstCellNum + 1..keyRow.lastCellNum) {
            val k = getCellAsString(keyRow, i)
            if (k == "数据起始行") {
                file.firstRowNum = Integer.parseInt(getCellAsString(valueRow, i))
                file.nextRowNum = file.firstRowNum
            } else if (k == "标题行") {
                titleRow = sheet.getRow(Integer.parseInt(getCellAsString(valueRow, i)) - 1)
            }
        }

        for (i in colNameRow.firstCellNum + 1..colNameRow.lastCellNum) {
            val colName = getCellAsString(colNameRow, i)
            if (colName.isBlank()) {
                continue
            }
            val name = getCellAsString(colNameRow, i)
            file.columnsPosition[name] = i
            if (titleRow != null) {
                val title = getCellAsString(titleRow, i)
                if (title.isNotBlank()) {
                    file.columnsTitle[name] = title
                }
            }
        }

        if (titleRow != null) {
          for (i in titleRow.firstCellNum..titleRow.lastCellNum) {
              val name = getCellAsString(colNameRow, i)
              val title = getCellAsString(titleRow, i)
              if ((name.isBlank() || name.trim() == "列名") && title.isNotBlank()) {
                  val colName = getExcelColumnName(i + 1)
                  val colKey = "_" + colName
                  file.columnsPosition[colKey] = i
                  file.columnsTitle[colKey] = colName + " " + title
              }
          }
        }
    }

    private fun readRows(file: ExcelFile, sheet: Sheet) {
        for (i in file.firstRowNum -1 .. sheet.lastRowNum) {
            val row = sheet.getRow(i)
            if (row == null || isEmptyRow(row)) {
                continue
            }

            val data = ExcelRow(i + 1)
            for (pair in file.columnsPosition) {
                data.columns[pair.key] = getCellAsString(row, pair.value)
            }
            file.rows.add(data)
            file.nextRowNum = i + 2
        }
    }

    private fun applyChanges(rows: ArrayList<ExcelRow>, changes: ArrayList<ExcelRow>): ArrayList<ExcelRow> {
        val changedRows = HashMap<Int, ExcelRow>()
        for (r in changes) {
            changedRows[r.row] = r
        }

        val result = ArrayList<ExcelRow>()
        result.ensureCapacity(rows.size + changes.size)
        for (r in rows) {
            val rowNum = r.row
            val changed = changedRows.remove(rowNum)
            if (changed != null) {
                val newRow = ExcelRow(rowNum)
                newRow.columns.putAll(r.columns)
                newRow.columns.putAll(changed.columns)

                result.add(newRow)
            } else {
                result.add(r)
            }
        }
        result.addAll(changedRows.values)
        result.sortBy { it.row }

        return result
    }

    private fun getCellAsString(row: Row, i: Int): String {
        if (i < 0) {
            return ""
        }

        val cell = row.getCell(i)
        if (cell != null) {
            if (cell.cellTypeEnum == CellType.FORMULA) {
                cell.setCellType(CellType.STRING)
                return cell.richStringCellValue.toString().trim()
            }
            return dataFormatter.formatCellValue(cell).trim()
        }

        return ""
    }

    private fun isEmptyRow(row: Row): Boolean {
        return (row.firstCellNum..row.lastCellNum).all {
            getCellAsString(row, it).isBlank()
        }
    }

    private fun getExcelColumnName(col: Int): String {
        var dividend = col
        var colName = ""

        while (dividend > 0) {
            val modulo = (dividend - 1) % 26
            colName = (65 + modulo).toChar().toString() + colName
            dividend = (dividend - modulo) / 26
        }

        return colName
    }
}
