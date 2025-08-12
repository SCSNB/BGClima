using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BGClima.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveAttrTimestamps : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                schema: "bgclima",
                table: "ProductAttributes");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                schema: "bgclima",
                table: "ProductAttributes");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                schema: "bgclima",
                table: "ProductAttributes",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                schema: "bgclima",
                table: "ProductAttributes",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");
        }
    }
}
