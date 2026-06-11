const translateTextForPDF = (text: string): string => {
  if (!text) return "";
  
  const trimmed = text.trim();
  
  const hasSinhala = /[\u0D80-\u0DFF]/.test(trimmed);
  const hasTamil = /[\u0B80-\u0BFF]/.test(trimmed);
  const hasLegacyAbhaya = /[\u00b0-\u00ff]/.test(trimmed) && (trimmed.includes("½") || trimmed.includes("Ò") || trimmed.includes("Ã"));

  if (hasSinhala || hasTamil || hasLegacyAbhaya) {
    if (trimmed.includes("නොසැල") || trimmed.includes("ධාවන") || trimmed.includes("šÒ½Ò") || trimmed.includes("ÜÃ") || trimmed.includes("±Ü")) {
      return "Reckless Driving";
    }
    if (trimmed.includes("වේග") || trimmed.includes("අධික") || trimmed.includes("ÀÓ")) {
      return "Overspeeding";
    }
    if (trimmed.includes("දුරකථන") || trimmed.includes("කථා")) {
      return "Mobile Phone Usage";
    }
    if (trimmed.includes("හැසිරීම") || trimmed.includes("නරක")) {
      return "Bad Driver Behavior";
    }
    if (trimmed.includes("ප්‍රමාද") || trimmed.includes("කාලය")) {
      return "Schedule Delay";
    }
    if (trimmed.includes("අපිරිසිදු") || trimmed.includes("කුණු")) {
      return "Cleanliness Issue";
    }
    if (trimmed.includes("හොඳ") || trimmed.includes("ස්තූති")) {
      return "Positive Feedback";
    }

    if (hasTamil) {
      return "Passenger Feedback (Tamil)";
    }
    return "Passenger Feedback (Sinhala)";
  }

  return text;
};

export interface ReportData {
  type: string;
  title: string;
  dateRange: string;
  data: any;
  format?: string;
}

export const generatePDFReport = async (reportData: ReportData) => {
  try {
    const { jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const { generateIncidentBarChart } = await import("./chart-generator");

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const { title, dateRange, data, type } = reportData;
    
    // Theme Colors
    const primaryColor: [number, number, number] = [15, 23, 42]; // dark slate #0f172a
    const secondaryColor: [number, number, number] = [37, 99, 235]; // blue #2563eb
    const accentColor: [number, number, number] = [220, 38, 38]; // red #dc2626
    const lightBg = [248, 250, 252]; // slate-50 #f8fafc
    const borderGray = [226, 232, 240]; // slate-200 #e2e8f0
    
    // Helper to draw section header
    const drawSectionHeader = (y: number, text: string) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(text, 14, y);
      doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.setLineWidth(0.8);
      doc.line(14, y + 2, 45, y + 2);
      return y + 8;
    };

    // --- PAGE 1 ---
    // Header Banner
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 42, "F");

    // Title & Logo
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("SafeDriver Authority", 14, 18);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(156, 163, 175); // gray-400
    doc.text("Real-time safety monitoring & AI telemetry analytics", 14, 25);

    // Meta Details (Right Side of Header)
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Report Title:", 135, 14);
    doc.setFont("helvetica", "normal");
    doc.text(title, 135, 19);

    doc.setFont("helvetica", "bold");
    doc.text("Date Range:", 135, 27);
    doc.setFont("helvetica", "normal");
    doc.text(dateRange, 135, 32);

    doc.setFont("helvetica", "bold");
    doc.text("Generated:", 135, 37);
    doc.setFont("helvetica", "normal");
    doc.text(new Date().toLocaleString(), 156, 37);

    let currentY = 55;

    // Executive Summary
    currentY = drawSectionHeader(currentY, "Executive Summary");

    let summaryCards: Array<{ label: string; value: string | number; color: [number, number, number] }> = [];

    if (type === "driver-performance") {
      const driverAlerts = data?.drivers?.reduce((sum: number, d: any) => sum + (Number(d.alerts) || 0), 0) ?? 0;
      summaryCards = [
        { label: "Total Drivers", value: data?.drivers?.length ?? 0, color: secondaryColor },
        { label: "Total Driver Alerts", value: driverAlerts, color: accentColor }
      ];
    } else if (type === "fleet-analytics") {
      const totalBuses = data?.fleetSummary?.total ?? (data?.buses?.length ?? 0);
      const activeBuses = data?.fleetSummary?.active ?? 0;
      const totalAlerts = data?.fleetSummary?.totalAlerts ?? data?.buses?.reduce((sum: number, b: any) => sum + (Number(b.alerts) || 0), 0) ?? 0;
      summaryCards = [
        { label: "Total Buses in Fleet", value: totalBuses, color: secondaryColor },
        { label: "Active Buses", value: activeBuses, color: [16, 185, 129] as [number, number, number] },
        { label: "Total Bus Alerts", value: totalAlerts, color: accentColor }
      ];
    } else if (type === "compliance") {
      summaryCards = [
        { label: "License Compliance", value: `${data?.compliance?.driverLicenseValidity ?? 100}%`, color: secondaryColor },
        { label: "Safety Training Rate", value: `${data?.compliance?.safetyTraining ?? 100}%`, color: [16, 185, 129] as [number, number, number] },
        { label: "Audit Rating Score", value: "A+", color: [79, 70, 229] as [number, number, number] }
      ];
    } else if (type === "custom-dynamic") {
      summaryCards = [
        { label: "Total Alerts (Filtered)", value: data?.counts?.total ?? 0, color: accentColor },
        { label: "Passenger Rating", value: `${data?.feedbacks?.averageRating || "N/A"}/5`, color: [16, 185, 129] as [number, number, number] }
      ];
    } else {
      summaryCards = [
        { label: "Total Active Alerts", value: data?.counts?.total ?? data?.summary?.totalAlerts ?? 0, color: accentColor },
        { label: "Active Drivers On-Duty", value: data?.summary?.activeDrivers ?? 0, color: secondaryColor },
        { label: "Global System Uptime", value: `${data?.summary?.systemUptime ?? 100}%`, color: [16, 185, 129] as [number, number, number] }
      ];
    }

    const boxHeight = 24;
    const boxGap = 5;
    const startX = 14;
    const totalAvailableWidth = 182;
    const numCards = summaryCards.length || 1;
    const boxWidth = (totalAvailableWidth - (boxGap * (numCards - 1))) / numCards;

    summaryCards.forEach((card, index) => {
      const x = startX + index * (boxWidth + boxGap);
      // Box Background
      doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.setLineWidth(0.3);
      doc.rect(x, currentY, boxWidth, boxHeight, "FD");

      // Left Accent Strip
      doc.setFillColor(card.color[0], card.color[1], card.color[2]);
      doc.rect(x, currentY, 2, boxHeight, "F");

      // Card Label
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(card.label, x + 5, currentY + 7);

      // Card Value
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(String(card.value), x + 5, currentY + 17);
    });

    currentY += boxHeight + 12;

    if (type === "custom-dynamic") {
      // Draw Dynamic Metrics / Infraction Details
      currentY = drawSectionHeader(currentY, "Custom Report Details");

      // Info row
      doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
      doc.rect(14, currentY, 182, 14, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(`Target Entity:  ${data?.entityName || "Entire Fleet"}`, 18, currentY + 9);

      currentY += 22;

      // Generate and embed Incident Bar Chart
      try {
        const counts = {
          drowsiness: data?.counts?.drowsiness || 0,
          distraction: data?.counts?.distraction || 0,
          phone: data?.counts?.phone || 0,
          smoking: data?.counts?.smoking || 0,
          drinking: data?.counts?.drinking || 0,
        };
        const chartDataUrl = await generateIncidentBarChart(counts);
        doc.addImage(chartDataUrl, "PNG", 14, currentY, 182, 91);
        currentY += 101;
      } catch (chartErr) {
        console.error("Failed to generate or embed chart:", chartErr);
      }

      // Table for Alert Log
      const alertDetails: any[] = data?.alertDetails || [];
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`Alert Log — ${alertDetails.length} Records`, 14, currentY);
      currentY += 4;

      const detailRows = alertDetails.map((a: any, i: number) => [
        String(i + 1),
        a.driverName,
        a.busNumber,
        a.type,
        a.timestamp,
        a.description || "-"
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [["#", "Driver Name", "Bus No.", "Alert Type", "Date & Time", "Description"]],
        body: detailRows.length > 0 ? detailRows : [["No records found", "", "", "", "", ""]],
        theme: "striped",
        headStyles: { fillColor: primaryColor, fontStyle: "bold", fontSize: 8 },
        bodyStyles: { fontSize: 7.5 },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 35 },
          2: { cellWidth: 25 },
          3: { cellWidth: 35 },
          4: { cellWidth: 40 },
          5: { cellWidth: 37 },
        },
        margin: { left: 14, right: 14 }
      });

      let finalY = (doc as any).lastAutoTable.finalY + 12;

      // Feedback Summary
      if (finalY > 250) {
        doc.addPage();
        finalY = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("Passenger Feedback Score", 14, finalY);
      finalY += 4;

      doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
      doc.rect(14, finalY, 182, 16, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text(`${data?.feedbacks?.averageRating || "N/A"} / 5`, 20, finalY + 11);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Average Rating based on ${data?.feedbacks?.total ?? 0} passenger comments`, 50, finalY + 10);

      finalY += 26;

      // Comments section (limit to fit page cleanly or add new page if needed)
      if (data?.feedbacks?.recent?.length > 0) {
        if (finalY > 230) {
          doc.addPage();
          finalY = 20;
        }
        finalY = drawSectionHeader(finalY, "Passenger Feedback Details");
        
        data.feedbacks.recent.forEach((f: any, idx: number) => {
          if (finalY > 260) {
            doc.addPage();
            finalY = 20;
          }
          doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
          doc.rect(14, finalY, 182, 22, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          
          const cleanTitle = translateTextForPDF(f.title || "Passenger Comment");
          const cleanComment = translateTextForPDF(f.comment || "No comment");

          doc.text(`${cleanTitle} - ${f.rating} Stars`, 18, finalY + 6);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.text(`By ${f.userName || "Anonymous"} | Bus: ${f.busNumber || "N/A"} | Date: ${f.date}`, 18, finalY + 11);
          
          doc.setFont("helvetica", "italic");
          doc.setFontSize(9);
          doc.setTextColor(51, 65, 85);
          doc.text(`"${cleanComment}"`, 18, finalY + 17);
          finalY += 26;
        });
      }

      // Evidence Photos section
      const alertsWithEvidence = alertDetails.filter((a: any) => a.evidence && typeof a.evidence === "string" && a.evidence.startsWith("http"));

      if (alertsWithEvidence.length > 0) {
        const evidencePromises = alertsWithEvidence.map(async (alert) => {
          try {
            const imgDataUrl: string = await new Promise((resolve, reject) => {
              const img = new Image();
              img.crossOrigin = "anonymous";
              img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                  ctx.drawImage(img, 0, 0);
                  resolve(canvas.toDataURL("image/jpeg", 0.8));
                } else {
                  reject(new Error("canvas context null"));
                }
              };
              img.onerror = reject;
              img.src = alert.evidence;
            });
            return { ...alert, imgDataUrl };
          } catch (err) {
            console.warn(`Skipping alert evidence for ${alert.id} because the image could not be loaded:`, err);
            return null;
          }
        });

        const resolvedAlerts = await Promise.all(evidencePromises);
        const alertsWithValidEvidence = resolvedAlerts.filter((a): a is any => a !== null);

        if (alertsWithValidEvidence.length > 0) {
          doc.addPage();
          let photoY = 20;
          photoY = drawSectionHeader(photoY, "Evidence Photos");

          for (let i = 0; i < alertsWithValidEvidence.length; i++) {
            const alert = alertsWithValidEvidence[i];
            if (photoY > 240) {
              doc.addPage();
              photoY = 20;
            }

            doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
            doc.rect(14, photoY, 182, 10, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.text(`${i + 1}. ${alert.type} — ${alert.driverName} | Bus: ${alert.busNumber} | ${alert.timestamp}`, 17, photoY + 6.5);
            photoY += 12;

            const imgDataUrl = alert.imgDataUrl;
            const maxW = 100;
            const maxH = 60;
            const tmpImg = new Image();
            tmpImg.src = imgDataUrl;
            const ratio = Math.min(maxW / (tmpImg.naturalWidth || 320), maxH / (tmpImg.naturalHeight || 240));
            const imgW = Math.min((tmpImg.naturalWidth || 320) * ratio, maxW);
            const imgH = Math.min((tmpImg.naturalHeight || 240) * ratio, maxH);

            doc.addImage(imgDataUrl, "JPEG", 14, photoY, imgW, imgH);
            photoY += imgH + 10;
          }
        }
      }
    } else if (type === "driver-performance") {
      // Drivers Performance
      currentY = drawSectionHeader(currentY, "Driver Performance Ranking");
      
      const tableBody = (data?.drivers || []).map((d: any) => [
        d.name,
        d.license,
        d.bus,
        d.route,
        String(d.alerts),
        d.status === "on_duty" ? "On Duty" : "Off Duty"
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [["Name", "License Number", "Bus No.", "Route Assigned", "Alerts", "Status"]],
        body: tableBody.length > 0 ? tableBody : [["No driver telemetry data available", "", "", "", "", ""]],
        theme: "striped",
        headStyles: { fillColor: primaryColor, fontStyle: "bold" },
        margin: { left: 14, right: 14 }
      });
    } else if (type === "fleet-analytics") {
      // Fleet Analytics — Bus Performance Table (mirrors Driver Performance)
      currentY = drawSectionHeader(currentY, "Bus Fleet Performance");

      const tableBody = (data?.buses || []).map((b: any) => [
        b.busNumberPlate,
        b.model,
        b.route,
        String(b.alerts),
        b.status === "active" ? "Active" : "Inactive"
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [["Bus No.", "Model", "Route", "Alerts", "Status"]],
        body: tableBody.length > 0 ? tableBody : [["No fleet data available", "", "", "", ""]],
        theme: "striped",
        headStyles: { fillColor: primaryColor, fontStyle: "bold" },
        margin: { left: 14, right: 14 }
      });
    } else if (type === "compliance") {
      // Compliance Report
      currentY = drawSectionHeader(currentY, "Regulatory Compliance Audit");

      const complianceList = [
        ["Driver License Validity Audits", `${data?.compliance?.driverLicenseValidity ?? 100}%`],
        ["Mandatory Vehicle Safety Inspections", `${data?.compliance?.vehicleInspections ?? 100}%`],
        ["Safety Program & Operator Training Completion", `${data?.compliance?.safetyTraining ?? 100}%`],
        ["Emergency & Incident Protocol Verification", `${data?.compliance?.emergencyProtocols ?? 100}%`],
        ["Telemetry Data Continuity Reporting", `${data?.compliance?.dataReporting ?? 100}%`]
      ];

      autoTable(doc, {
        startY: currentY,
        head: [["Compliance Indicator", "Audit Score"]],
        body: complianceList,
        theme: "striped",
        headStyles: { fillColor: primaryColor, fontStyle: "bold" },
        margin: { left: 14, right: 14 }
      });
    } else {
      // Safety Summary: grouped summary table first
      currentY = drawSectionHeader(currentY, "Safety Alerts Summary");

      const summaryTableBody = (data?.alerts || []).map((a: any) => [
        a.type,
        String(a.count),
        String(a.high),
        String(a.medium),
        String(a.low),
        a.avgResponse
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [["Alert Type", "Total Alerts", "High Risk", "Med Risk", "Low Risk", "Avg Response"]],
        body: summaryTableBody.length > 0 ? summaryTableBody : [["No alert distribution data available", "", "", "", "", ""]],
        theme: "striped",
        headStyles: { fillColor: primaryColor, fontStyle: "bold" },
        margin: { left: 14, right: 14 }
      });

      let nextY = (doc as any).lastAutoTable.finalY + 12;

      // Generate and embed Incident Bar Chart
      try {
        if (nextY > 170) {
          doc.addPage();
          nextY = 20;
        }
        const counts = {
          drowsiness: data?.counts?.drowsiness || 0,
          distraction: data?.counts?.distraction || 0,
          phone: data?.counts?.phone || 0,
          smoking: data?.counts?.smoking || 0,
          drinking: data?.counts?.drinking || 0,
        };
        const chartDataUrl = await generateIncidentBarChart(counts);
        doc.addImage(chartDataUrl, "PNG", 14, nextY, 182, 91);
      } catch (chartErr) {
        console.error("Failed to generate or embed chart in summary:", chartErr);
      }

      // Detailed Alert Log (new page)
      const alertDetails: any[] = data?.alertDetails || [];
      if (alertDetails.length > 0) {
        doc.addPage();
        let detailY = 20;
        detailY = drawSectionHeader(detailY, `Alert Log — ${alertDetails.length} Records`);

        // Table of all alerts (no images first)
        const detailRows = alertDetails.map((a: any, i: number) => [
          String(i + 1),
          a.driverName,
          a.busNumber,
          a.type,
          a.timestamp,
          a.description || "-"
        ]);

        autoTable(doc, {
          startY: detailY,
          head: [["#", "Driver Name", "Bus No.", "Alert Type", "Date & Time", "Description"]],
          body: detailRows.length > 0 ? detailRows : [["No records found", "", "", "", "", ""]],
          theme: "striped",
          headStyles: { fillColor: primaryColor, fontStyle: "bold", fontSize: 8 },
          bodyStyles: { fontSize: 7.5 },
          columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 35 },
            2: { cellWidth: 25 },
            3: { cellWidth: 35 },
            4: { cellWidth: 40 },
            5: { cellWidth: 37 },
          },
          margin: { left: 14, right: 14 }
        });

        // Evidence Photos section — embed images
        const alertsWithEvidence = alertDetails.filter((a: any) => a.evidence && typeof a.evidence === "string" && a.evidence.startsWith("http"));

        if (alertsWithEvidence.length > 0) {
          // Pre-filter to only include those that load successfully
          const evidencePromises = alertsWithEvidence.map(async (alert) => {
            try {
              const imgDataUrl: string = await new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => {
                  const canvas = document.createElement("canvas");
                  canvas.width = img.naturalWidth;
                  canvas.height = img.naturalHeight;
                  const ctx = canvas.getContext("2d");
                  if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    resolve(canvas.toDataURL("image/jpeg", 0.8));
                  } else {
                    reject(new Error("canvas context null"));
                  }
                };
                img.onerror = reject;
                img.src = alert.evidence;
              });
              return { ...alert, imgDataUrl };
            } catch (err) {
              console.warn(`Skipping alert evidence for ${alert.id} because the image could not be loaded:`, err);
              return null;
            }
          });

          const resolvedAlerts = await Promise.all(evidencePromises);
          const alertsWithValidEvidence = resolvedAlerts.filter((a): a is any => a !== null);

          if (alertsWithValidEvidence.length > 0) {
            doc.addPage();
            let photoY = 20;
            photoY = drawSectionHeader(photoY, "Evidence Photos");

            for (let i = 0; i < alertsWithValidEvidence.length; i++) {
              const alert = alertsWithValidEvidence[i];
              if (photoY > 240) {
                doc.addPage();
                photoY = 20;
              }

              // Alert label
              doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
              doc.rect(14, photoY, 182, 10, "F");
              doc.setFont("helvetica", "bold");
              doc.setFontSize(9);
              doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
              doc.text(`${i + 1}. ${alert.type} — ${alert.driverName} | Bus: ${alert.busNumber} | ${alert.timestamp}`, 17, photoY + 6.5);
              photoY += 12;

              const imgDataUrl = alert.imgDataUrl;
              // Scale image to fit width=100mm, max height=60mm
              const maxW = 100;
              const maxH = 60;
              const tmpImg = new Image();
              tmpImg.src = imgDataUrl;
              const ratio = Math.min(maxW / (tmpImg.naturalWidth || 320), maxH / (tmpImg.naturalHeight || 240));
              const imgW = Math.min((tmpImg.naturalWidth || 320) * ratio, maxW);
              const imgH = Math.min((tmpImg.naturalHeight || 240) * ratio, maxH);

              doc.addImage(imgDataUrl, "JPEG", 14, photoY, imgW, imgH);
              photoY += imgH + 10;
            }
          }
        }
      }
    }

    // Save/Download the generated PDF
    const dateStr = new Date().toISOString().replace(/T/, "-").replace(/:/g, "").split(".")[0];
    const fileName = `SafeDriver-${type}-Report-${dateStr}.pdf`;
    doc.save(fileName);

  } catch (error) {
    console.error("Error in client-side PDF generation:", error);
    throw error;
  }
};
