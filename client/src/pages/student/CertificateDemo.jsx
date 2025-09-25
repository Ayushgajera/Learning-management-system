import React from "react";
import {
  PDFDownloadLink,
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";

// 🎨 PDF styles
const styles = StyleSheet.create({
  page: {
    backgroundColor: "#fafafa",
    padding: 40,
    fontFamily: "Helvetica",
    display: "flex",
    flexDirection: "column",
    border: "8 solid #1e3a8a",
  },
  borderInner: {
    border: "4 solid #facc15",
    padding: 30,
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontSize: 36,
    textTransform: "uppercase",
    marginBottom: 12,
    textAlign: "center",
    fontWeight: "bold",
    color: "#1e3a8a",
    letterSpacing: 2,
  },
  subHeading: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
    color: "#6b7280",
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginVertical: 10,
    textAlign: "center",
  },
  course: {
    fontSize: 22,
    fontWeight: "semibold",
    color: "#1e3a8a",
    marginVertical: 10,
    textAlign: "center",
  },
  footer: {
    marginTop: 30,
    fontSize: 14,
    textAlign: "center",
    color: "#6b7280",
  },
  signatureArea: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
    width: "80%",
  },
  signatureBox: {
    borderTop: "1 solid #111",
    width: "40%",
    textAlign: "center",
    paddingTop: 4,
    fontSize: 12,
  },
});

// 📝 PDF Document Component
const MyCertificate = ({
  name = "John Doe",
  course = "React Mastery Bootcamp",
  date = new Date().toLocaleDateString(),
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.borderInner}>
        <Text style={styles.heading}>Certificate of Completion demo</Text>
        <Text style={styles.subHeading}>This is proudly presented to</Text>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.subHeading}>for successfully completing</Text>
        <Text style={styles.course}>{course}</Text>
        <Text style={styles.footer}>Issued on: {date}</Text>

        <View style={styles.signatureArea}>
          <Text style={styles.signatureBox}>Instructor</Text>
          <Text style={styles.signatureBox}>Director</Text>
        </View>
      </View>
    </Page>
  </Document>
);

// 🌟 Main Demo Component
const CertificateDemo = () => {
  const name = "John Doe";
  const course = "React Mastery Bootcamp";
  const date = new Date().toLocaleDateString();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-gray-100 to-gray-200">
      <h1 className="text-4xl font-bold text-indigo-700 mb-6">
        Download Your Certificate
      </h1>

      <PDFDownloadLink
        document={<MyCertificate name={name} course={course} date={date} />}
        fileName="certificate.pdf"
        className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-3 px-6 rounded-lg shadow-lg mb-8 transition-transform transform hover:scale-105"
      >
        {({ loading }) =>
          loading ? "Generating PDF..." : "Download Certificate PDF"
        }
      </PDFDownloadLink>

      {/* 🎯 Certificate Preview */}
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-3xl text-center border-8 border-indigo-900 relative">
        <div className="absolute inset-1 border-4 border-yellow-400 rounded-xl"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold text-indigo-900 mb-2 uppercase tracking-widest">
            Certificate of Completion
          </h2>
          <p className="text-gray-500 mb-6">This is proudly presented to</p>
          <p className="text-2xl font-bold text-gray-900 mb-2">{name}</p>
          <p className="text-gray-500 mb-4">for successfully completing</p>
          <p className="text-xl font-semibold text-indigo-800 mb-6">{course}</p>
          <p className="text-gray-500">Issued on: {date}</p>

          <div className="flex justify-around mt-10">
            <div className="border-t border-gray-800 w-40 pt-1 text-sm">
              Instructor
            </div>
            <div className="border-t border-gray-800 w-40 pt-1 text-sm">
              Director
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateDemo;
