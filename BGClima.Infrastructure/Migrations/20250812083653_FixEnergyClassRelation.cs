using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BGClima.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixEnergyClassRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Products_EnergyClasses_EnergyClassId1",
                schema: "bgclima",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Products_EnergyClassId1",
                schema: "bgclima",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                schema: "bgclima",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "EnergyClassId1",
                schema: "bgclima",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                schema: "bgclima",
                table: "Products");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                schema: "bgclima",
                table: "Products",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<int>(
                name: "EnergyClassId1",
                schema: "bgclima",
                table: "Products",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                schema: "bgclima",
                table: "Products",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.CreateIndex(
                name: "IX_Products_EnergyClassId1",
                schema: "bgclima",
                table: "Products",
                column: "EnergyClassId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Products_EnergyClasses_EnergyClassId1",
                schema: "bgclima",
                table: "Products",
                column: "EnergyClassId1",
                principalSchema: "bgclima",
                principalTable: "EnergyClasses",
                principalColumn: "Id");
        }
    }
}
