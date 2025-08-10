using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BGClima.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveTimestampsFromUnnecessaryTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                schema: "bgclima",
                table: "ProductType");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                schema: "bgclima",
                table: "ProductImage");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                schema: "bgclima",
                table: "EnergyClass");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                schema: "bgclima",
                table: "BTU");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                schema: "bgclima",
                table: "Brand");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                schema: "bgclima",
                table: "Brand");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                schema: "bgclima",
                table: "ProductType",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                schema: "bgclima",
                table: "ProductImage",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                schema: "bgclima",
                table: "EnergyClass",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                schema: "bgclima",
                table: "BTU",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                schema: "bgclima",
                table: "Brand",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                schema: "bgclima",
                table: "Brand",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");
        }
    }
}
