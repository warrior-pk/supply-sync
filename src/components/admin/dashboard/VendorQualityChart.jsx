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
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const VendorQualityChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQualityData();
  }, []);

  const fetchQualityData = async () => {
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
          quality: metric.qualityScore || 0,
        }));

        chartData.sort((a, b) => b.quality - a.quality);
        setData(chartData);
      }
    } catch (error) {
      console.error("Error fetching quality data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Vendor Quality Scores</CardTitle>
        <CardDescription>
          Quality rating by vendor (0-5 star scale)
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
                  domain={[0, 5]}
                  label={{
                    value: "Quality Score",
                    angle: -90,
                    position: "insideLeft",
                    offset: 10,
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                  formatter={(value) => `${value.toFixed(1)} stars`}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Bar dataKey="quality" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-96 flex items-center justify-center text-muted-foreground">
            No quality data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VendorQualityChart;
