"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";

interface TableRowData {
  no: number;
  tentang: string;
  jenis: string;
  jenisColor: string;
  opd: string;
  waktu: string;
  tempat: string;
}

const tableData: TableRowData[] = [
  {
    no: 1,
    tentang:
      "Kerjasama Bidang Pendidikan dan Kesehatan Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae, tempora temporibus. Quidem explicabo nulla nihil praesentium aspernatur numquam, ut optio.",
    jenis: "MOU",
    jenisColor: "primary",
    opd: "Dinas Pendidikan dan Kebudayaan dan Kesehatan dan Kesejahteraan Rakyat",
    waktu: "2024-01-15",
    tempat: "Tana Tidung",
  },
  {
    no: 2,
    tentang: "Kerjasama Bidang Kesehatan",
    jenis: "PKS",
    jenisColor: "blue",
    opd: "Dinas Kesehatan",
    waktu: "2024-02-20",
    tempat: "Sesayap",
  },
  {
    no: 3,
    tentang: "Kerjasama Pembangunan Infrastruktur",
    jenis: "NK",
    jenisColor: "green",
    opd: "PUPR",
    waktu: "2024-03-10",
    tempat: "Tana Tidung",
  },
  {
    no: 4,
    tentang: "Kerjasama Bidang Pertanian",
    jenis: "MOU",
    jenisColor: "primary",
    opd: "Dinas Pertanian",
    waktu: "2024-04-05",
    tempat: "Sesayap",
  },
  {
    no: 5,
    tentang: "Kerjasama Bidang Pariwisata",
    jenis: "PKS",
    jenisColor: "blue",
    opd: "Dinas Pariwisata",
    waktu: "2024-05-12",
    tempat: "Tana Tidung",
  },
  {
    no: 6,
    tentang: "Kerjasama Pembangunan Jalan",
    jenis: "NK",
    jenisColor: "green",
    opd: "PUPR",
    waktu: "2024-06-18",
    tempat: "Sesayap",
  },
  {
    no: 7,
    tentang: "Kerjasama Bidang Sosial",
    jenis: "MOU",
    jenisColor: "primary",
    opd: "Dinas Sosial",
    waktu: "2024-07-22",
    tempat: "Tana Tidung",
  },
  {
    no: 8,
    tentang: "Kerjasama Bidang Lingkungan Hidup",
    jenis: "PKS",
    jenisColor: "blue",
    opd: "DLH",
    waktu: "2024-08-30",
    tempat: "Sesayap",
  },
];

const ITEMS_PER_PAGE = 5;

export default function KerjasamaPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    jenis: "",
    opd: "",
    tempat: "",
    tahun: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleColumns, setVisibleColumns] = useState({
    no: false,
    tentang: true,
    jenis: true,
    opd: false,
    waktuTempat: true,
    file: true,
  });
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);

  const getBadgeClasses = (color: string) => {
    switch (color) {
      case "primary":
        return "bg-primary text-foreground";
      case "blue":
        return "bg-blue-100 text-blue-800";
      case "green":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const uniqueValues = useMemo(
    () => ({
      jenis: [...new Set(tableData.map((item) => item.jenis))],
      opd: [...new Set(tableData.map((item) => item.opd))],
      tempat: [...new Set(tableData.map((item) => item.tempat))],
      tahun: [...new Set(tableData.map((item) => item.waktu.substring(0, 4)))],
    }),
    []
  );

  const filteredData = useMemo(() => {
    return tableData.filter((item) => {
      const matchesSearch =
        item.tentang.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.jenis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.opd.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tempat.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesJenis = !filters.jenis || item.jenis === filters.jenis;
      const matchesOpd = !filters.opd || item.opd === filters.opd;
      const matchesTempat = !filters.tempat || item.tempat === filters.tempat;
      const matchesTahun =
        !filters.tahun || item.waktu.substring(0, 4) === filters.tahun;

      return (
        matchesSearch &&
        matchesJenis &&
        matchesOpd &&
        matchesTempat &&
        matchesTahun
      );
    });
  }, [searchTerm, filters]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const handleFilterChange = (
    filterType: keyof typeof filters,
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      jenis: "",
      opd: "",
      tempat: "",
      tahun: "",
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const toggleColumn = (columnKey: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  const getVisibleColumnCount = () => {
    return Object.values(visibleColumns).filter((visible) => visible).length;
  };

  const renderPaginationButton = (page: number, isActive = false) => (
    <button
      key={page}
      onClick={() => handlePageChange(page)}
      className={`px-3 py-2 mx-1 text-sm font-medium rounded-lg transition-colors duration-200 ${
        isActive
          ? "bg-primary text-foreground"
          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
      }`}
    >
      {page}
    </button>
  );

  return (
    <div className="min-h-screen bg-section py-[80px]">
      <div className="py-[100px]">
        <div className="mx-auto px-4 md:px-[140px] w-full max-w-[1280px]">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-[30px] mb-[100px]">
            <div className="flex flex-col gap-[30px] w-full lg:w-[580px]">
              <div className="flex flex-col gap-2.5">
                <h1 className="text-[32px] md:text-[40px] leading-tight md:leading-[50px] font-bold text-foreground">
                  Data Kerjasama Terkini
                </h1>
                <p className="text-base md:text-lg leading-7 md:leading-8 font-medium text-gray-700">
                  Lihat data lengkap kerjasama yang telah dilakukan dengan
                  berbagai pihak untuk pembangunan Tana Tidung.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-1.5">
                  <div className="flex justify-center items-center w-[24px] h-[24px] bg-foreground rounded-full">
                    <Image
                      src="/assets/images/icons/ic_check.svg"
                      alt="icon"
                      width={14}
                      height={14}
                      className="brightness-0 invert"
                    />
                  </div>
                  <p className="text-[14px] font-bold leading-[16px] text-gray-700">
                    Data terupdate real-time
                  </p>
                </div>
              </div>
            </div>

            <div className="relative shrink-0 w-full lg:w-[470px] h-[100px] lg:h-[192px] bg-gradient-to-br from-primary/20 to-foreground/10 rounded-[20px] flex items-center justify-center border border-primary/30">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Image
                    src="/assets/images/icons/3dcube.svg"
                    alt="data icon"
                    width={32}
                    height={32}
                  />
                </div>
                <p className="text-foreground font-semibold text-lg">
                  Visualisasi Data
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  Dashboard interaktif akan hadir segera
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-[20px] p-6 mb-6 shadow-lg">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Cari data kerjasama..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Filter Button */}
                <div className="relative">
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold text-gray-700 transition-all duration-200 border border-gray-300"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 2v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                      />
                    </svg>
                    Filter
                    {Object.values(filters).some((f) => f) && (
                      <span className="bg-primary text-foreground text-xs px-2 py-1 rounded-full">
                        {Object.values(filters).filter((f) => f).length}
                      </span>
                    )}
                  </button>

                  {/* Filter Dropdown */}
                  {isFilterOpen && (
                    <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-6 z-10">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Filter Data
                        </h3>
                        <button
                          onClick={clearFilters}
                          className="text-primary hover:text-primary/80 text-sm font-medium"
                        >
                          Reset
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Jenis Kerjasama
                          </label>
                          <select
                            value={filters.jenis}
                            onChange={(e) =>
                              handleFilterChange("jenis", e.target.value)
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          >
                            <option value="">Semua Jenis</option>
                            {uniqueValues.jenis.map((jenis) => (
                              <option key={jenis} value={jenis}>
                                {jenis}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            OPD Terkait
                          </label>
                          <select
                            value={filters.opd}
                            onChange={(e) =>
                              handleFilterChange("opd", e.target.value)
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          >
                            <option value="">Semua OPD</option>
                            {uniqueValues.opd.map((opd) => (
                              <option key={opd} value={opd}>
                                {opd}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tempat
                          </label>
                          <select
                            value={filters.tempat}
                            onChange={(e) =>
                              handleFilterChange("tempat", e.target.value)
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          >
                            <option value="">Semua Tempat</option>
                            {uniqueValues.tempat.map((tempat) => (
                              <option key={tempat} value={tempat}>
                                {tempat}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tahun
                          </label>
                          <select
                            value={filters.tahun}
                            onChange={(e) =>
                              handleFilterChange("tahun", e.target.value)
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          >
                            <option value="">Semua Tahun</option>
                            {uniqueValues.tahun.map((tahun) => (
                              <option key={tahun} value={tahun}>
                                {tahun}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Column Visibility Button */}
                <div className="relative">
                  <button
                    onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)}
                    className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold text-gray-700 transition-all duration-200 border border-gray-300"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 0V17m0-10a2 2 0 012 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2z"
                      />
                    </svg>
                  </button>

                  {/* Column Menu Dropdown */}
                  {isColumnMenuOpen && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-100">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Tampilkan Kolom
                        </h3>
                        <button
                          onClick={() => setIsColumnMenuOpen(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={visibleColumns.no}
                            onChange={() => toggleColumn("no")}
                            className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            No
                          </span>
                        </label>

                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={visibleColumns.tentang}
                            onChange={() => toggleColumn("tentang")}
                            className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            Tentang
                          </span>
                        </label>

                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={visibleColumns.jenis}
                            onChange={() => toggleColumn("jenis")}
                            className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            Jenis
                          </span>
                        </label>

                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={visibleColumns.opd}
                            onChange={() => toggleColumn("opd")}
                            className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            OPD Terkait
                          </span>
                        </label>

                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={visibleColumns.waktuTempat}
                            onChange={() => toggleColumn("waktuTempat")}
                            className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            Waktu/Tempat
                          </span>
                        </label>

                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={visibleColumns.file}
                            onChange={() => toggleColumn("file")}
                            className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            File
                          </span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Results Count */}
              <div className="text-sm text-gray-600">
                Menampilkan {paginatedData.length} dari {filteredData.length}{" "}
                data
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="relative mb-6">
            <div className="overflow-x-auto rounded-[20px]">
              <table className="w-full border-collapse bg-white rounded-[20px] shadow-lg min-w-[900px]">
                <thead>
                  <tr className="bg-foreground text-white">
                    {visibleColumns.no && (
                      <th className="px-6 py-4 text-left text-[14px] font-semibold w-fit">
                        No
                      </th>
                    )}
                    {visibleColumns.tentang && (
                      <th className="px-6 py-4 text-left text-[14px] font-semibold min-w-[450px]">
                        Tentang
                      </th>
                    )}
                    {visibleColumns.jenis && (
                      <th className="px-6 py-4 text-left text-[14px] font-semibold">
                        Jenis
                      </th>
                    )}
                    {visibleColumns.opd && (
                      <th className="px-6 py-4 text-left text-[14px] font-semibold min-w-[150px]">
                        OPD Terkait
                      </th>
                    )}
                    {visibleColumns.waktuTempat && (
                      <th className="px-6 py-4 text-left text-[14px] font-semibold">
                        Waktu/Tempat
                      </th>
                    )}
                    {visibleColumns.file && (
                      <th
                        className="px-6 py-4 text-left text-[14px] font-semibold sticky right-0 bg-foreground shadow-[-4px_0_8px_rgba(0,0,0,0.15)] z-50 min-w-[140px]"
                        style={{
                          position: "sticky",
                          right: 0,
                        }}
                      >
                        File
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((row, index) => (
                      <tr
                        key={row.no}
                        className={`border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 ${
                          index === paginatedData.length - 1 ? "border-b-0" : ""
                        } group`}
                      >
                        {visibleColumns.no && (
                          <td className="px-6 py-4 text-[14px] font-semibold text-gray-900">
                            {row.no}
                          </td>
                        )}
                        {visibleColumns.tentang && (
                          <td className="px-6 py-4 text-[14px] text-gray-800 font-medium">
                            <div className="line-clamp-3 leading-relaxed w-[450px] max-w-[450px]">
                              {row.tentang}
                            </div>
                          </td>
                        )}
                        {visibleColumns.jenis && (
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold ${getBadgeClasses(
                                row.jenisColor
                              )}`}
                            >
                              {row.jenis}
                            </span>
                          </td>
                        )}
                        {visibleColumns.opd && (
                          <td className="px-6 py-4 text-[14px] text-gray-800">
                            <div className="line-clamp-2 leading-relaxed w-[350px]">
                              {row.opd}
                            </div>
                          </td>
                        )}
                        {visibleColumns.waktuTempat && (
                          <td className="px-6 py-4 text-[14px] text-gray-700">
                            <div className="flex flex-col gap-1">
                              <div className="font-medium text-nowrap">
                                {row.waktu}
                              </div>
                              <div className="text-gray-600 text-xs">
                                {row.tempat}
                              </div>
                            </div>
                          </td>
                        )}
                        {visibleColumns.file && (
                          <td
                            className="px-6 py-4 sticky right-0 bg-white group-hover:bg-gray-50 shadow-[-4px_0_8px_rgba(0,0,0,0.15)] z-50 transition-colors duration-200 min-w-[160px]"
                            style={{
                              position: "sticky",
                              right: 0,
                            }}
                          >
                            <a
                              href="#"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-primary hover:text-foreground rounded-lg text-[12px] font-semibold text-gray-700 transition-all duration-200 hover:shadow-sm"
                            >
                              <Image
                                src="/assets/images/icons/ic_download.svg"
                                alt="download"
                                width={16}
                                height={16}
                              />
                              Download
                            </a>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={getVisibleColumnCount()}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <svg
                            className="h-12 w-12 text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <p className="text-lg font-medium">
                            Tidak ada data ditemukan
                          </p>
                          <p className="text-sm">
                            Coba ubah kata kunci pencarian atau filter
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-lg">
              <div className="text-sm text-gray-600">
                Halaman {currentPage} dari {totalPages}
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 mx-1 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                  }`}
                >
                  ‹ Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return renderPaginationButton(page, page === currentPage);
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-2 text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }
                )}

                <button
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 mx-1 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                  }`}
                >
                  Next ›
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
