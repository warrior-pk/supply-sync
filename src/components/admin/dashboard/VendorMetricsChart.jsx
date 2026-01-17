import React, { useState, useEffect } from "react";
import performanceMetricsService from "@/services/performance-metrics.service";
import vendorService from "@/services/vendor.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const VendorMetricsChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetricsData();
  }, []);

  const fetchMetricsData = async () => {
    try {
      setLoading(true);
      const [metricsRes, vendorsRes] = await Promise.all([
        performanceMetricsService.getAll(),
        vendorService.getAll(),
      ]);

      if (metricsRes.success && vendorsRes.success) {
        const vendorMap = {};
        vendorsRes.data.forEach((vendor) => {
          vendorMap[vendor.id] = vendor.name;
        });

        const chartData = (metricsRes.data || []).map((metric) => ({
          name: vendorMap[metric.vendorId] || `Vendor ${metric.vendorId}`,
          performance: metric.onTimeDeliveryRate || 0,
          quality: metric.qualityScore || 0,
        }));

        chartData.sort((a, b) => b.performance - a.performance);
        setData(chartData);
      }
    } catch (error) {
      console.error("Error fetching metrics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
            padding: "8px 12px",
          }}
        >
          <p style={{ color: "hsl(var(--foreground))", margin: "0 0 4px 0" }}>
            {payload[0].payload.name}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, margin: "2px 0" }}>
              {entry.name}:{" "}
              {entry.name === "Quality"
                ? `${entry.value.toFixed(1)} stars`
                : `${entry.value}%`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Vendor Performance Metrics</CardTitle>
        <CardDescription>
          On-time delivery (%) and quality score (0-5 stars) by vendor
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-96 w-full" />
        ) : data.length > 0 ? (
          <div className="w-full h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  yAxisId="left"
                  domain={[0, 100]}
                  label={{
                    value: "Performance (%)",
                    angle: -90,
                    position: "insideLeft",
                    offset: 10,
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 5]}
                  label={{
                    value: "Quality Score",
                    angle: 90,
                    position: "insideRight",
                    offset: 10,
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  formatter={(value) =>
                    value === "performance"
                      ? "On-Time Delivery (%)"
                      : "Quality Score"
                  }
                />
                <Bar
                  yAxisId="left"
                  dataKey="performance"
                  fill="#10b981"
                  radius={[8, 8, 0, 0]}
                  name="performance"
                />
                <Bar
                  yAxisId="right"
                  dataKey="quality"
                  fill="#3b82f6"
                  radius={[8, 8, 0, 0]}
                  name="quality"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-96 flex items-center justify-center text-muted-foreground">
            No metrics data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VendorMetricsChart;
